import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useMemo } from 'react';
import { useAppSelector } from '../../services/redux/store';
import { getBankAccounts, getCategories, getCurrencyRates, getFlows } from '../../services/redux/moneySlice';
import { Category } from '../../types';

interface CategoriesDoughnutGraphProps {
    bankAccounts: number[];
    monthsCount: number
}

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

export default function CategoriesDoughnutGraph({ bankAccounts, monthsCount }: CategoriesDoughnutGraphProps) {
    const flows = useAppSelector(getFlows);
    const categories = useAppSelector(getCategories);
    const accounts = useAppSelector(getBankAccounts);
    const currencyRates = useAppSelector(getCurrencyRates);

    const format = (value: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: "EUR" }).format(value)

    const firstDate = useMemo(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - monthsCount);
        return date;
    }, [monthsCount])

    const filteredFlows = useMemo(() => (
        flows
            .filter(flow => bankAccounts.includes(flow.bank_account)
                && new Date(flow.date) >= firstDate
            )
    ), [flows, bankAccounts, firstDate])
    const jsoned = JSON.stringify(filteredFlows)

    const [data, labels] = useMemo(() => {
        console.log("calculating CategoriesDoughnutGraph")

        const per_category = new Map<number, { category: Category; inc: number; exp: number; }>();
        for (const flow of filteredFlows) {
            const currency = accounts.find(acc => acc.id === flow.bank_account)?.currency ?? "EUR";
            const amount = flow.cost / currencyRates[currency];
            const initial = per_category.get(flow.category);
            if (amount > 0) {
                // income
                if (initial === undefined) {
                    const category = categories.find(c => c.id === flow.category);
                    if (category === undefined) continue;
                    per_category.set(flow.category, { category, inc: amount, exp: 0.0 });
                } else {
                    per_category.set(flow.category, { ...initial, inc: initial.inc + amount });
                }
            } else {
                // expense
                if (initial === undefined) {
                    const category = categories.find(c => c.id === flow.category);
                    if (category === undefined) continue;
                    per_category.set(flow.category, { category, inc: 0.0, exp: amount });
                } else {
                    per_category.set(flow.category, { ...initial, exp: initial.exp + amount });
                }
            }
        }
        const raw_data = Array.from(per_category.values())
            .sort((a, b) => b.exp - a.exp)
        const [sum_inc, sum_exp] = raw_data.reduce((total, flow) => ([
            total[0] + flow.inc,
            total[1] + flow.exp,
        ]), [0.0, 0.0])

        const labels = raw_data.map(categ => {
            const inc_percent = Math.round((categ.inc ?? 0) / sum_inc * 1000) / 10;
            const exp_percent = Math.round((categ.exp ?? 0) / sum_exp * 1000) / 10;
            return [
                `${categ.category.name}: ${format(categ.inc ?? 0)} (${inc_percent}%)`,
                `${categ.category.name}: ${format(categ.exp ?? 0)} (${exp_percent}%)`
            ]
        })

        const data = {
            labels: raw_data.map(categ => categ.category.name),
            datasets: [
                {
                    label: "Incomes",
                    data: raw_data.map(categ => categ.inc),
                    backgroundColor: raw_data.map(categ => categ.category.color)
                },
                {
                    label: "Expenses",
                    data: raw_data.map(categ => categ.exp),
                    backgroundColor: raw_data.map(categ => categ.category.color)
                },
            ]
        }

        return [data, labels];
    }, [jsoned, format, accounts, categories, currencyRates])

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