import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Tooltip } from "chart.js";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";

import { getBankAccounts, getCurrencyRates, getFlows, getTransfers } from "../../services/redux/moneySlice";
import { useAppSelector } from "../../services/redux/store";
import { BankAccount, Flow } from "../../types";

interface AccountsHistoryGraphProps {
    startDate: string;
    endDate?: string;
    bankAccounts: number[];
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface Point {
    x: string;
    y: number;
    label: string;
}

interface AccountMapValue {
  name: BankAccount["name"];
  color: BankAccount["color"];
  initialBalance: BankAccount["initialBalance"];
  currency: BankAccount["currency"];
}

const getTime = (day: string | Date) => {
  const parsed = new Date(day);
  parsed.setMinutes(parsed.getMinutes() + parsed.getTimezoneOffset());
  return parsed.getTime();
};

function getAccountsMap(accounts: BankAccount[], bankAccounts: number[]) {
  const result = new Map<number | "total", AccountMapValue | undefined>(bankAccounts.map(id => [
    id,
    accounts.find(acc => acc.id === id),
  ]));
  result.set("total", { name: "Total", "color": "#009926", currency: "EUR", initialBalance: 0 });
  return result;
}

export default function AccountsHistoryGraph({ startDate, endDate, bankAccounts }: AccountsHistoryGraphProps) {
  const flows = useAppSelector(getFlows);
  const transfers = useAppSelector(getTransfers);
  const accounts = useAppSelector(getBankAccounts);
  const currencyRates = useAppSelector(getCurrencyRates);

  const format = (value: number, currency: string) => new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);

  const sortedFlows = useMemo(() => {
    const result = new Map<number, Flow[]>();
    flows
      .filter(flow => bankAccounts.includes(flow.bankAccount))
      .forEach(flow => {
        const time = getTime(flow.date);
        const previous = result.get(time);
        if (previous === undefined) {
          result.set(time, [flow]);
        } else {
          previous.push(flow);
        }
      });
    return result;
  }, [flows, bankAccounts]);


  const data = useMemo(() => {
    console.debug("calculating AccountsHistoryGraph");
    const startDateParsed = new Date(startDate);
    const currenciesMap = new Map(accounts.map(acc => [acc.id, acc.currency]));
    const accountsMap = getAccountsMap(accounts, bankAccounts);

    const filteredTransfers = transfers.filter(tr => bankAccounts.includes(tr.fromAccount) || bankAccounts.includes(tr.toAccount));

    const iterationDay = new Date(Math.min.apply(null, accounts.map(acc => getTime(acc.creationDate))));
    iterationDay.setHours(0, 0, 0, 0);
    const result = new Map<number | "total", Point[]>(bankAccounts.map(acc => [
      acc,
      [],
    ]));
    result.set("total", []);
    const xLabels: string[] = [];

    const balancePerAcc = new Map(bankAccounts.map(accountId => [
      accountId,
      accountsMap.get(accountId)?.initialBalance ?? -10000,
    ]));
    const today = endDate ? new Date(endDate) : new Date();
    today.setHours(0, 0, 0, 0);

    function addValue(accountId: number | "total", day: string, value: number) {
      const res = result.get(accountId);
      if (res === undefined) return;
      const currency = accountsMap.get(accountId)?.currency ?? "EUR";
      res.push({
        x: day,
        y: value,
        label: format(value, currency),
      });
    }

    function getFlowsOfDay(day: Date) {
      return sortedFlows.get(day.getTime()) ?? [];
    }

    function getTransfersOfDay(day: Date) {
      return filteredTransfers.filter(transfer => {
        const d = new Date(transfer.date);
        return d.getUTCDate() === day.getDate()
                    && d.getUTCMonth() === day.getMonth()
                    && d.getUTCFullYear() === day.getFullYear();
      });
    }

    while (iterationDay <= today) {
      const dayDiff = new Map(bankAccounts.map(acc => [acc, balancePerAcc.get(acc)]));
      for (const exp of getFlowsOfDay(iterationDay)) {
        if (bankAccounts.includes(exp.bankAccount)) {
          const prev = dayDiff.get(exp.bankAccount) ?? 0;
          dayDiff.set(exp.bankAccount, prev + exp.cost);
        }
      }
      for (const transfer of getTransfersOfDay(iterationDay)) {
        if (bankAccounts.includes(transfer.fromAccount)) {
          const prev = dayDiff.get(transfer.fromAccount) ?? 0;
          dayDiff.set(transfer.fromAccount, prev - transfer.amount);
        }
        if (bankAccounts.includes(transfer.toAccount)) {
          const prev = dayDiff.get(transfer.toAccount) ?? 0;
          dayDiff.set(transfer.toAccount, prev + transfer.amount * transfer.rate);
        }
      }

      const shouldUpdateGraph = iterationDay > startDateParsed && (iterationDay.getDay() === 1 || iterationDay.getTime() === today.getTime());
      let total = 0;
      const formatedDay = iterationDay.toLocaleDateString(undefined, { timeZone: "UTC" });
      dayDiff.forEach((value, accountId) => {
        if (value === undefined) return;
        const rValue = Math.round(value * 1000) / 1000;
        if (rValue < 0) {
          console.warn("Found value below 0:", rValue, "on", formatedDay, "for account", accountId);
        }
        if (shouldUpdateGraph) {
          addValue(accountId, formatedDay, rValue);
        }
        balancePerAcc.set(accountId, rValue);
        total += rValue / currencyRates[currenciesMap.get(accountId) ?? "EUR"];
      });
      if (shouldUpdateGraph) {
        addValue("total", formatedDay, total);
        xLabels.push(formatedDay);
      }

      iterationDay.setDate(iterationDay.getDate() + 1);
    }

    return {
      labels: xLabels,
      datasets: Array.from(result.entries())
        .map<[AccountMapValue | undefined, Point[]]>(([accountId, value]) => [accountsMap.get(accountId), value])
        .filter(([account, _value]) => account !== undefined && (account.name !== "Total" || bankAccounts.length > 1))
        .map(([account, value]) => ({
          label: account?.name,
          data: value,
          borderColor: account?.color,
          backgroundColor: account?.color,
        })),
    };
  }, [startDate, endDate, bankAccounts, sortedFlows, transfers, accounts, currencyRates]);

  return (
    <Line
      data={data}
      options={{
        responsive: true,
        datasets: {
          line: {
            pointRadius: 1,
            pointBackgroundColor: "white",
            spanGaps: true,
            normalized: true,
            parsing: false,
            tension: 0.1,
          },
        },
        plugins: {
          legend: {
            position: "right",
          },
          tooltip: {
            intersect: false,
            callbacks: {
              label: a => a.dataset.label + ": " + (a.raw as Point).label,
            },
          },
        },
      }}
    />
  );
}