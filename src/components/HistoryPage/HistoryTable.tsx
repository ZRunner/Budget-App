import "../../css/HistoryTable.scss";

import { useEffect, useMemo, useState } from "react";
import { FaArrowDown, FaArrowUp, FaEquals } from "react-icons/fa";

import apiHandler from "../../services/database";
import { getCurrencyRates, getFlows, getTransfers } from "../../services/redux/moneySlice";
import { useAppSelector } from "../../services/redux/store";
import { Balance } from "../../types";

interface HistoryTableProps {
    startDate: string;
    endDate?: string;
    bankAccounts: number[]
}

export default function HistoryTable({ startDate, endDate, bankAccounts }: HistoryTableProps) {
  const [accounts, setAccounts] = useState<Balance[]>([]);
  const flows = useAppSelector(getFlows);
  const transfers = useAppSelector(getTransfers);
  const currencyRates = useAppSelector(getCurrencyRates);

  const format = (value: number, currency: string) => new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
  const currenciesMap = new Map(accounts.map(acc => [acc.id, acc.currency]));

  // last day of the history, either today or the provided "endDate"
  const lastDay = useMemo(() => {
    const day = endDate ? new Date(endDate) : new Date();
    return day;
  }, [endDate]);

  // first day of the history, either 1 year before the last day or the provided "startDate"
  const firstDay = useMemo(() => {
    const max = new Date(lastDay);
    max.setFullYear(max.getFullYear() - 1);

    const day = max < new Date(startDate) ? new Date(startDate) : max;
    return day;
  }, [startDate, lastDay]);

  // load accounts at the start of the history
  useEffect(() => {
    let active = true;
    load();
    return () => {
      active = false;
    };

    function dateToStr(yourDate: Date) {
      const offset = yourDate.getTimezoneOffset();
      yourDate = new Date(yourDate.getTime() - (offset * 60 * 1000));
      return yourDate.toISOString().split("T")[0];
    }

    async function load() {
      const res = await apiHandler.getHistoricBalances(dateToStr(firstDay));
      if (!active) {
        return;
      }
      setAccounts(res);
    }
  }, [firstDay]);

  const history = useMemo(() => {
    console.log("calculating history");

    if (accounts.length === 0) {
      return [];
    }

    function getFlowsOfDay(day: Date) {
      return flows.filter(flow => {
        const d = new Date(flow.date);
        return bankAccounts.includes(flow.bankAccount)
                    && d.getUTCDate() === day.getDate()
                    && d.getUTCMonth() === day.getMonth()
                    && d.getUTCFullYear() === day.getFullYear();
      });
    }

    function getTransfersOfDay(day: Date) {
      return transfers.filter(transfer => {
        const d = new Date(transfer.date);
        return (
          bankAccounts.includes(transfer.fromAccount)
                    || bankAccounts.includes(transfer.toAccount)
        )
                    && d.getUTCDate() === day.getDate()
                    && d.getUTCMonth() === day.getMonth()
                    && d.getUTCFullYear() === day.getFullYear();
      });
    }

    const dayState = new Map(accounts.map(acc => [acc.id, acc.balance]));
    const day = new Date(firstDay);
    const result = [];

    const getTotal = (bal: typeof dayState) => {
      let total = 0;
      bal.forEach((val, i) => {
        if (bankAccounts.includes(i)) {
          total += val / currencyRates[currenciesMap.get(i) ?? "EUR"];
        }
      });
      return total;
    };

    let prev_result = getTotal(dayState);
    let prev_day = new Date(day);

    while (day <= lastDay) {
      // first day is already processed from apiHandler.getHistoricBalances
      //  so we don't need to process it again
      if (day > firstDay) {
        for (const exp of getFlowsOfDay(day)) {
          if (bankAccounts.includes(exp.bankAccount)) {
            dayState.set(exp.bankAccount, dayState.get(exp.bankAccount)! + exp.cost);
          }
        }
        for (const transfer of getTransfersOfDay(day)) {
          if (bankAccounts.includes(transfer.fromAccount)) {
            dayState.set(transfer.fromAccount, dayState.get(transfer.fromAccount)! - transfer.amount);
          }
          if (bankAccounts.includes(transfer.toAccount)) {
            dayState.set(transfer.toAccount, dayState.get(transfer.toAccount)! + transfer.amount * transfer.rate);
          }
        }
        // fix round issues
        dayState.forEach((val, i) => {
          if (Math.abs(val) < 0.001) {
            dayState.set(i, 0.0);
          }
        });
      }

      if (day.getMonth() !== prev_day.getMonth()) {
        result.push({
          txt: prev_day.toLocaleDateString(undefined, { timeZone: "UTC", month: "long", year: "numeric" }),
          id: day.getMonth() + "-" + day.getFullYear(),
        });
        prev_day = new Date(day);
      }

      const total = getTotal(dayState);
      result.push({
        id: day.toLocaleDateString(undefined, { timeZone: "UTC" }),
        day: new Date(day),
        bal: new Map(dayState),
        total: total,
        diff: total - prev_result,
      });
      day.setDate(day.getDate() + 1);
      prev_result = total;
    }

    return result.reverse();

  }, [firstDay, lastDay, bankAccounts, accounts, flows, transfers]);

  return (
    <table className="history-table table table-striped table-sm">
      <thead className="table-light">
        <tr>
          <th scope="col">Date</th>
          {bankAccounts.map(id => (
            <th key={id} scope="col">{accounts.find(acc => acc.id === id)?.name}</th>
          ))}
          <th scope="col">Total</th>
          <th scope="col">Évolution</th>
        </tr>
      </thead>
      <tbody>
        {history.map(row => (
          row.txt ?
            <tr key={row.id} className="table-primary">
              <td colSpan={bankAccounts.length + 3}>
                {row.txt}
              </td>
            </tr> :
            <tr key={row.id}>
              <td>{row.day?.toLocaleDateString(undefined, { timeZone: "UTC" })}</td>

              {bankAccounts.map(i => (
                <td key={i}>{format(row.bal!.get(i)!, currenciesMap.get(i) ?? "EUR")}</td>
              ))}

              <td>{format(row.total!, "EUR")}</td>

              {row.diff! > 0
                ? <td className="diff-up">
                  <FaArrowUp />
                  <span>{format(row.diff!, "EUR")}</span>
                </td>
                : row.diff! < 0
                  ? <td className="diff-down">
                    <FaArrowDown />
                    <span>{format(row.diff!, "EUR")}</span>
                  </td>
                  : <td className="diff-equ">
                    <FaEquals size="1em" />
                    <span>{format(row.diff!, "EUR")}</span>
                  </td>
              }
            </tr>
        ))}
      </tbody>
    </table>
  );
}
