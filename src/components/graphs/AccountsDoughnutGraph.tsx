import { useEffect, useMemo, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import apiHandler from '../../services/database';
import { useCurrencyFormat } from '../../services/hooks';
import { Balance } from '../../types';

interface AccountsHistoryGraphProps {
    bankAccounts: number[];
}

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

export default function AccountsDoughnutGraph({ bankAccounts }: AccountsHistoryGraphProps) {
    const format = useCurrencyFormat();
    const [balances, setBalances] = useState<Balance[]>([]);

    useEffect(() => {
        let active = true
        load()
        return () => { active = false }

        async function load() {
            const res = await apiHandler.getCurrentBalances();
            if (!active) { return }
            setBalances(res)
        }
    }, [])

    const filteredBalances = useMemo(() => (
        balances
            .filter(b => bankAccounts.includes(b.id))
            .sort((a, b) => bankAccounts.indexOf(a.id) - bankAccounts.indexOf(b.id))
    ), [balances, bankAccounts])
    const jsoned = JSON.stringify(filteredBalances);

    const [data, labels] = useMemo(() => {
        console.log("calculating AccountsDoughnutGraph")
        const sum = filteredBalances.reduce((total, acc) => total + acc.balance, 0.0);

        const labels = filteredBalances.map(acc => {
            const percent = Math.round(acc.balance / sum * 1000) / 10;
            return `${acc.name}: ${format.format(acc.balance)} (${percent}%)`
        })

        const data = {
            labels: filteredBalances.map(b => b.name),
            datasets: [{
                data: filteredBalances.map(b => b.balance),
                backgroundColor: filteredBalances.map(b => b.color),
            }]
        }

        return [data, labels]
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
                        label: (a) => labels[a.dataIndex]
                    }
                }
            }
        }}
    />
}
