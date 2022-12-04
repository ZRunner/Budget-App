import { FaEquals, FaArrowDown, FaArrowUp } from 'react-icons/fa';
import '../css/HistoryTable.scss';
import { useAppSelector } from '../services/redux/store';
import { getCurrencyRates, getFlows, getTransfers } from '../services/redux/moneySlice';
import { useEffect, useMemo, useState } from 'react';
import { Balance } from '../types';
import apiHandler from '../services/database';

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

    const format = (value: number, currency: string) => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
    const currenciesMap = new Map(accounts.map(acc => [acc.id, acc.currency]));

    // last day of the history, either today or the provided "endDate"
    const lastDay = useMemo(() => {
        const day = endDate ? new Date(endDate) : new Date();
        day.setHours(0, 0, 0, 0);
        return day;
    }, [endDate])

    // first day of the history, either 1 year before the last day or the provided "startDate"
    const firstDay = useMemo(() => {
        let max = new Date(lastDay);
        max.setFullYear(max.getFullYear() - 1);

        const day = max < new Date(startDate) ? new Date(startDate) : max;
        day.setHours(0, 0, 0, 0);
        return day;
    }, [startDate, lastDay]);

    // load accounts at the start of the history
    useEffect(() => {
        let active = true
        load()
        return () => { active = false }

        function dateToStr(yourDate: Date) {
            const offset = yourDate.getTimezoneOffset()
            yourDate = new Date(yourDate.getTime() - (offset * 60 * 1000))
            return yourDate.toISOString().split('T')[0]
        }

        async function load() {
            const res = await apiHandler.getHistoricBalances(dateToStr(firstDay));
            if (!active) { return }
            setAccounts(res)
        }
    }, [firstDay])

    const history = useMemo(() => {
        console.log("calculating history");

        if (accounts.length === 0) {
            return [];
        }

        function getFlowsOfDay(day: Date) {
            return flows.filter(flow => {
                const d = new Date(flow.date)
                return bankAccounts.includes(flow.bank_account)
                    && d.getUTCDate() === day.getDate()
                    && d.getUTCMonth() === day.getMonth()
                    && d.getUTCFullYear() === day.getFullYear();
            });
        }

        function getTransfersOfDay(day: Date) {
            return transfers.filter(transfer => {
                const d = new Date(transfer.date)
                return (
                    bankAccounts.includes(transfer.from_account)
                    || bankAccounts.includes(transfer.to_account)
                )
                    && d.getUTCDate() === day.getDate()
                    && d.getUTCMonth() === day.getMonth()
                    && d.getUTCFullYear() === day.getFullYear();
            });
        }

        let dayState = new Map(accounts.map(acc => [acc.id, acc.balance]));
        let day = new Date(firstDay);
        let result = [];

        const getTotal = (bal: typeof dayState) => {
            let total = 0;
            bal.forEach((val, i) => {
                if (bankAccounts.includes(i)) {
                    total += val / currencyRates[currenciesMap.get(i) ?? "EUR"]
                }
            })
            return total;
        }

        let prev_result = getTotal(dayState);
        let prev_day = new Date(day);

        while (day <= lastDay) {
            for (let exp of getFlowsOfDay(day)) {
                if (bankAccounts.includes(exp.bank_account)) {
                    dayState.set(exp.bank_account, dayState.get(exp.bank_account)! + exp.cost);
                }
            }
            for (let transfer of getTransfersOfDay(day)) {
                if (bankAccounts.includes(transfer.from_account)) {
                    dayState.set(transfer.from_account, dayState.get(transfer.from_account)! - transfer.amount);
                }
                if (bankAccounts.includes(transfer.to_account)) {
                    dayState.set(transfer.to_account, dayState.get(transfer.to_account)! + transfer.amount * transfer.rate);
                }
            }
            // fix round issues
            dayState.forEach((val, i) => {
                if (Math.abs(val) < 0.001) { dayState.set(i, 0.0) }
            })

            if (day.getMonth() !== prev_day.getMonth()) {
                result.push({
                    txt: prev_day.toLocaleDateString(undefined, { timeZone: "UTC", month: 'long', year: 'numeric' }),
                    id: day.getMonth() + "-" + day.getFullYear()
                })
                prev_day = new Date(day);
            }

            const total = getTotal(dayState)
            result.push({
                id: day.toLocaleDateString(undefined, { timeZone: "UTC" }),
                day: new Date(day),
                bal: new Map(dayState),
                total: total,
                diff: total - prev_result
            })
            day.setDate(day.getDate() + 1);
            prev_result = total;
        }

        return result.reverse();

    }, [firstDay, lastDay, bankAccounts, accounts, flows, transfers])

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
                                <td key={i}>{format(row.bal!.get(i)!, currenciesMap.get(i) ?? 'EUR')}</td>
                            ))}

                            <td>{format(row.total!, 'EUR')}</td>

                            {row.diff! > 0
                                ? <td className="diff-up">
                                    <FaArrowUp />
                                    <span>{format(row.diff!, 'EUR')}</span>
                                </td>
                                : row.diff! < 0
                                    ? <td className="diff-down">
                                        <FaArrowDown />
                                        <span>{format(row.diff!, 'EUR')}</span>
                                    </td>
                                    : <td className="diff-equ">
                                        <FaEquals size="1em" />
                                        <span>{format(row.diff!, 'EUR')}</span>
                                    </td>
                            }
                        </tr>
                ))}
            </tbody>
        </table>
    )
}
