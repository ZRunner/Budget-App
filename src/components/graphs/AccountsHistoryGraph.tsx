import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Legend, Tooltip } from "chart.js";
import { getBankAccounts, getFlows, getTransfers } from '../../services/redux/moneySlice';
import { useAppSelector } from '../../services/redux/store';
import { useMemo } from 'react';
import { BankAccount, Flow } from '../../types';

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
}

const CurrFormat = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' })

const getTime = (day: string | Date) => {
    let parsed = new Date(day);
    parsed.setMinutes(parsed.getMinutes() + parsed.getTimezoneOffset());
    return parsed.getTime();
}


export default function AccountsHistoryGraph({ startDate, endDate, bankAccounts }: AccountsHistoryGraphProps) {
    const flows = useAppSelector(getFlows);
    const transfers = useAppSelector(getTransfers);
    const accounts = useAppSelector(getBankAccounts);

    function getAccountsMap() {
        let result = new Map<number | "total", BankAccount | undefined>(bankAccounts.map(id => [
            id,
            accounts.find(acc => acc.id === id)
        ]))
        result.set('total', { name: 'Total', 'color': "#009926" } as any)
        return result
    }

    const sortedFlows = useMemo(() => {
        const result = new Map<number, Flow[]>();
        flows
            .filter(flow => bankAccounts.includes(flow.bank_account))
            .forEach(flow => {
                const time = getTime(flow.date);
                const previous = result.get(time);
                if (previous === undefined) {
                    result.set(time, [flow])
                } else {
                    previous.push(flow);
                }
            })
        return result;
    }, [flows, bankAccounts])

    const filteredTransfers = useMemo(() => (
        transfers.filter(tr => bankAccounts.includes(tr.from_account) || bankAccounts.includes(tr.to_account))
    ), [transfers, bankAccounts])

    const data = useMemo(() => {
        console.debug("calculating AccountsHistoryGraph")
        const accountsMap = getAccountsMap();

        let day = new Date(startDate);
        day.setHours(0, 0, 0, 0)
        let result = new Map<number | "total", Point[]>(bankAccounts.map(acc => [
            acc,
            []
        ]))
        result.set('total', [])
        let labels: string[] = [];

        let balancePerAcc = new Map(bankAccounts.map(acc => [
            acc,
            accountsMap.get(acc)?.initial_balance ?? 0
        ]))
        let today = endDate ? new Date(endDate) : new Date();
        today.setHours(0, 0, 0, 0);

        function addValue(acc_id: number | "total", day: string, value: number) {
            let res = result.get(acc_id);
            if (res === undefined) return;
            res.push({
                x: day,
                y: value
            })
        }

        function getFlowsOfDay(day: Date) {
            return sortedFlows.get(day.getTime()) ?? []
        }

        function getTransfersOfDay(day: Date) {
            return filteredTransfers.filter(transfer => {
                const d = new Date(transfer.date)
                return d.getUTCDate() === day.getDate()
                    && d.getMonth() === day.getMonth()
                    && d.getFullYear() === day.getFullYear();
            });
        }

        while (day <= today) {
            let dayDiff = new Map(bankAccounts.map(acc => {
                return [acc, balancePerAcc.get(acc)]
            }))
            for (let exp of getFlowsOfDay(day)) {
                if (bankAccounts.includes(exp.bank_account)) {
                    const prev = dayDiff.get(exp.bank_account) ?? 0;
                    dayDiff.set(exp.bank_account, prev + exp.cost);
                }
            }
            for (let exp of getTransfersOfDay(day)) {
                if (bankAccounts.includes(exp.from_account)) {
                    const prev = dayDiff.get(exp.from_account) ?? 0;
                    dayDiff.set(exp.from_account, prev - exp.amount);
                }
                if (bankAccounts.includes(exp.to_account)) {
                    const prev = dayDiff.get(exp.to_account) ?? 0;
                    dayDiff.set(exp.to_account, prev + exp.amount);
                }
            }

            let total = 0;
            const formatedDay = day.toLocaleDateString(undefined, { timeZone: "UTC" });
            dayDiff.forEach((value, acc) => {
                if (value === undefined) return;
                const r_value = Math.round(value * 1000) / 1000
                addValue(acc, formatedDay, r_value);
                balancePerAcc.set(acc, r_value);
                total += r_value
            })
            addValue('total', formatedDay, total);
            labels.push(formatedDay);

            day.setDate(day.getDate() + 1);
        }

        return {
            labels,
            datasets: Array.from(result.entries())
                .map<[BankAccount | undefined, Point[]]>(([acc_id, value]) => [accountsMap.get(acc_id), value])
                .filter(([account, _value]) => account !== undefined && (account.name !== "Total" || bankAccounts.length > 1))
                .map(([account, value]) => ({
                    label: account!.name,
                    data: value,
                    borderColor: account!.color,
                    backgroundColor: account!.color,
                }))
        }
    }, [startDate, endDate, bankAccounts, sortedFlows, transfers, accounts])

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
                    }
                },
                plugins: {
                    legend: {
                        position: "right",
                    },
                    tooltip: {
                        intersect: false,
                        callbacks: {
                            label: a => a.dataset.label + ": " + CurrFormat.format((a.raw as Point).y),
                        }
                    }
                }
            }}
        />
    )
}