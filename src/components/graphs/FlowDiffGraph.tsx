import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Legend, Tooltip } from "chart.js";
import { getFlows } from '../../services/redux/moneySlice';
import { useAppSelector } from '../../services/redux/store';

interface FlowDiffGraphProps {
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


export default function FlowDiffGraph({ startDate, endDate, bankAccounts }: FlowDiffGraphProps) {
    const flows = useAppSelector(getFlows);

    const filteredFlows = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(0, 0, 0, 0);

        return flows.filter(flow => {
            const d = new Date(flow.date);
            return bankAccounts.includes(flow.bank_account)
                && d > start && d < end
        })
    }, [flows, startDate, endDate, bankAccounts])

    const data = useMemo(() => {
        console.debug("calculating FlowDiffGraph")
        function getFlowsOfDay(day: Date) {
            return filteredFlows.filter(flow => {
                const d = new Date(flow.date)
                return d.getUTCDate() === day.getDate()
                    && d.getMonth() === day.getMonth()
                    && d.getFullYear() === day.getFullYear();
            });
        }

        let day = new Date(startDate);
        day.setHours(0, 0, 0, 0);
        let today = endDate ? new Date(endDate) : new Date();
        today.setHours(0, 0, 0, 0);
        let labels: string[] = [];
        let expensesData: Point[] = [];
        let earningsData: Point[] = [];

        while (day <= today) {
            const day_flows = getFlowsOfDay(day);
            let earned = 0.0;
            let spent = 0.0;
            for (const flow of day_flows) {
                if (flow.cost > 0) earned += flow.cost
                else spent += flow.cost;
            }

            labels.push(day.toLocaleDateString(undefined, { timeZone: "UTC" }));
            expensesData.push({
                x: day.toLocaleDateString(undefined, { timeZone: "UTC" }),
                y: Math.round(spent * 100) / 100,
            })
            earningsData.push({
                x: day.toLocaleDateString(undefined, { timeZone: "UTC" }),
                y: Math.round(earned * 100) / 100,
            })

            day.setDate(day.getDate() + 1);
        }

        return {
            labels: labels,
            datasets: [
                {
                    label: "Earnings",
                    data: earningsData,
                    borderColor: "#009926",
                    backgroundColor: '#009900',
                },
                {
                    label: 'Expenses',
                    data: expensesData,
                    borderColor: "#ff0040",
                    backgroundColor: '#ff0066',
                },
            ],
        }
    }, [startDate, endDate, filteredFlows])

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
                        mode: 'index',
                        callbacks: {
                            footer: a => "Total: " + CurrFormat.format((a[0].raw as Point).y + (a[1].raw as Point).y),
                            label: a => a.dataset.label + ": " + CurrFormat.format((a.raw as Point).y),
                        }
                    }
                }
            }}
        />
    )
}