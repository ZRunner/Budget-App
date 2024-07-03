import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Tooltip } from "chart.js";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";

import { getBankAccounts, getCurrencyRates, getFlows } from "../../services/redux/moneySlice";
import { useAppSelector } from "../../services/redux/store";
import { Flow } from "../../types";

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

const CurrFormat = new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" });

const getTime = (day: string | Date) => {
  const parsed = new Date(day);
  parsed.setMinutes(parsed.getMinutes() + parsed.getTimezoneOffset());
  return parsed.getTime();
};


export default function FlowDiffGraph({ startDate, endDate, bankAccounts }: FlowDiffGraphProps) {
  const flows = useAppSelector(getFlows);
  const currencyRates = useAppSelector(getCurrencyRates);
  const accounts = useAppSelector(getBankAccounts);

  const filteredFlows = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(0, 0, 0, 0);
    const result = new Map<number, Flow[]>();

    flows
      .filter(flow => {
        const d = new Date(flow.date);
        return bankAccounts.includes(flow.bankAccount)
                    && d > start && d < end;
      })
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
  }, [flows, startDate, endDate, bankAccounts]);

  const data = useMemo(() => {
    console.debug("calculating FlowDiffGraph");
    function getFlowsOfDay(day: Date) {
      return filteredFlows.get(day.getTime()) ?? [];
    }

    const day = new Date(startDate);
    day.setHours(0, 0, 0, 0);
    const today = endDate ? new Date(endDate) : new Date();
    today.setHours(0, 0, 0, 0);
    const labels: string[] = [];
    const expensesData: Point[] = [];
    const earningsData: Point[] = [];

    const currencyRatesMap = new Map(accounts.map(acc => [acc.id, currencyRates[acc.currency]]));

    while (day <= today) {
      const day_flows = getFlowsOfDay(day);
      let earned = 0.0;
      let spent = 0.0;
      for (const flow of day_flows) {
        const currencyRate = currencyRatesMap.get(flow.bankAccount) ?? 1;
        if (flow.cost > 0) earned += flow.cost / currencyRate;
        else spent += flow.cost / currencyRate;
      }

      const formatedDay = day.toLocaleDateString(undefined, { timeZone: "UTC" });

      labels.push(formatedDay);
      expensesData.push({
        x: formatedDay,
        y: Math.round(spent * 100) / 100,
      });
      earningsData.push({
        x: formatedDay,
        y: Math.round(earned * 100) / 100,
      });

      day.setDate(day.getDate() + 1);
    }

    return {
      labels: labels,
      datasets: [
        {
          label: "Earnings",
          data: earningsData,
          borderColor: "#009926",
          backgroundColor: "#009900",
        },
        {
          label: "Expenses",
          data: expensesData,
          borderColor: "#ff0040",
          backgroundColor: "#ff0066",
        },
      ],
    };
  }, [startDate, endDate, filteredFlows, accounts, currencyRates]);

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
            mode: "index",
            callbacks: {
              footer: a => "Total: " + CurrFormat.format((a[0].raw as Point).y + (a[1].raw as Point).y),
              label: a => a.dataset.label + ": " + CurrFormat.format((a.raw as Point).y),
            },
          },
        },
      }}
    />
  );
}