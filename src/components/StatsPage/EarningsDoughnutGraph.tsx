import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useEffect, useMemo, useState } from 'react';
import apiHandler from '../../services/database';
import { EarningPerAccount } from '../../types';

interface EarningsDoughnutGraphProps {
    bankAccounts: number[];
    monthsCount: number
}

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

export default function EarningsDoughnutGraph({ bankAccounts, monthsCount }: EarningsDoughnutGraphProps) {
    const [earningsPerAcc, setEarningsPerAcc] = useState<EarningPerAccount[]>([]);

    const format = (value: number, currency: string) => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value)

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
            const date = new Date();
            date.setMonth(date.getMonth() - monthsCount);
            const res = await apiHandler.getEarningsPerAccount(dateToStr(date));
            if (!active) { return }
            setEarningsPerAcc(res)
        }
    }, [monthsCount])

    const filteredAccounts = useMemo(() => (
        earningsPerAcc
            .filter(acc => bankAccounts.includes(acc.id)
                && (
                    (acc.expenses !== 0 && acc.expenses !== null)
                    || (acc.incomes !== 0 && acc.incomes !== null)
                )
            )
            .sort((a, b) => bankAccounts.indexOf(a.id) - bankAccounts.indexOf(b.id))
    ), [earningsPerAcc, bankAccounts])
    const jsoned = JSON.stringify(filteredAccounts)

    const [data, labels] = useMemo(() => {
        console.log("calculating EarningsDoughnutGraph")
        const [sum_inc, sum_exp] = filteredAccounts.reduce((total, acc) => ([
            total[0] + (acc.incomes ?? 0),
            total[1] + (acc.expenses ?? 0),
        ]), [0.0, 0.0])

        const labels = filteredAccounts.map(acc => {
            const inc = Math.round((acc.incomes ?? 0) / sum_inc * 1000) / 10;
            const exp = Math.round((acc.expenses ?? 0) / sum_exp * 1000) / 10;
            return [
                `${acc.name}: ${format(acc.incomes ?? 0, acc.currency)} (${inc}%)`,
                `${acc.name}: ${format(acc.expenses ?? 0, acc.currency)} (${exp}%)`
            ]
        })

        const data = {
            labels: filteredAccounts.map(acc => acc.name),
            datasets: [
                {
                    label: "Incomes",
                    data: filteredAccounts.map(acc => acc.incomes),
                    backgroundColor: filteredAccounts.map(acc => acc.color)
                },
                {
                    label: "Expenses",
                    data: filteredAccounts.map(acc => acc.expenses),
                    backgroundColor: filteredAccounts.map(acc => acc.color)
                },
            ]
        }

        return [data, labels];
    }, [jsoned, format])

    return <Doughnut
        data={data}
        style={{ maxHeight: 400 }}
        options={{
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        footer: (a) => a[0].dataset.label ?? "",
                        label: (a) => labels[a.dataIndex][a.datasetIndex]
                    }
                }
            }
        }}
    />
}