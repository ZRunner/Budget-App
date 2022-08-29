import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Legend, Tooltip } from "chart.js";
import { getBankAccounts, getFlows, getTransfers } from '../../services/redux/moneySlice';
import { useAppSelector } from '../../services/redux/store';
import { useMemo } from 'react';
import { BankAccount } from '../../types';

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

        function addValue(acc_name: number | "total", day: Date, value: number) {
            let res = result.get(acc_name);
            if (res === undefined) return;
            res.push({
                x: day.toLocaleDateString(undefined, { timeZone: "UTC" }),
                y: value
            })
        }

        function getFlowsOfDay(day: Date) {
            return flows.filter(flow => {
                const d = new Date(flow.date)
                return bankAccounts.includes(flow.bank_account)
                    && d.getUTCDate() === day.getDate()
                    && d.getMonth() === day.getMonth()
                    && d.getFullYear() === day.getFullYear();
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
            dayDiff.forEach((value, acc) => {
                if (value === undefined) return;
                const r_value = Math.round(value * 1000) / 1000
                addValue(acc, day, r_value);
                balancePerAcc.set(acc, r_value);
                total += r_value
            })
            addValue('total', day, total);
            labels.push(day.toLocaleDateString(undefined, { timeZone: "UTC" }));

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
    }, [startDate, endDate, bankAccounts, flows, transfers, accounts])

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