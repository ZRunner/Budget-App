import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";

import { getBankAccounts, getCategories, getCurrencyRates, getFlows } from "../../services/redux/moneySlice";
import { useAppSelector } from "../../services/redux/store";
import { Category } from "../../types";

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

  const format = (value: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(value);

  const firstDate = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsCount);
    return date;
  }, [monthsCount]);

  const filteredFlows = useMemo(() => (
    flows
      .filter(flow => bankAccounts.includes(flow.bankAccount)
                && new Date(flow.date) >= firstDate
      )
  ), [flows, bankAccounts, firstDate]);
  const jsoned = JSON.stringify(filteredFlows);

  const [data, labels] = useMemo(() => {
    console.log("calculating CategoriesDoughnutGraph");

    const perCategory = new Map<number, { category: Category; inc: number; exp: number; }>();
    for (const flow of filteredFlows) {
      const currency = accounts.find(acc => acc.id === flow.bankAccount)?.currency ?? "EUR";
      const amount = flow.cost / currencyRates[currency];
      const initial = perCategory.get(flow.category);
      if (amount > 0) {
        // income
        if (initial === undefined) {
          const category = categories.find(c => c.id === flow.category);
          if (category === undefined) continue;
          perCategory.set(flow.category, { category, inc: amount, exp: 0.0 });
        } else {
          perCategory.set(flow.category, { ...initial, inc: initial.inc + amount });
        }
      } else if (initial === undefined) {
        const category = categories.find(c => c.id === flow.category);
        if (category === undefined) continue;
        perCategory.set(flow.category, { category, inc: 0.0, exp: amount });
      } else {
        perCategory.set(flow.category, { ...initial, exp: initial.exp + amount });
      }
    }
    const rawData = Array.from(perCategory.values())
      .sort((a, b) => b.exp - a.exp);
    const [sumInc, sumExp] = rawData.reduce((total, flow) => ([
      total[0] + flow.inc,
      total[1] + flow.exp,
    ]), [0.0, 0.0]);

    const _labels = rawData.map(categ => {
      const incPercent = Math.round((categ.inc ?? 0) / sumInc * 1000) / 10;
      const expPercent = Math.round((categ.exp ?? 0) / sumExp * 1000) / 10;
      return [
        `${categ.category.name}: ${format(categ.inc ?? 0)} (${incPercent}%)`,
        `${categ.category.name}: ${format(categ.exp ?? 0)} (${expPercent}%)`,
      ];
    });

    const _data = {
      labels: rawData.map(categ => categ.category.name),
      datasets: [
        {
          label: "Incomes",
          data: rawData.map(categ => categ.inc),
          backgroundColor: rawData.map(categ => categ.category.color),
        },
        {
          label: "Expenses",
          data: rawData.map(categ => categ.exp),
          backgroundColor: rawData.map(categ => categ.category.color),
        },
      ],
    };

    return [_data, _labels];
  }, [jsoned, format, accounts, categories, currencyRates]);

  return <Doughnut
    data={data}
    style={{ maxHeight: 400 }}
    options={{
      plugins: {
        legend: {
          position: "right",
        },
        tooltip: {
          callbacks: {
            footer: (a) => a[0].dataset.label ?? "",
            label: (a) => labels[a.dataIndex][a.datasetIndex],
          },
        },
      },
    }}
  />;
}