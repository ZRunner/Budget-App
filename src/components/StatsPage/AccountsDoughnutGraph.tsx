import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { useEffect, useMemo, useState } from "react";
import { Doughnut } from "react-chartjs-2";

import apiHandler from "../../services/database";
import { getCurrencyRates } from "../../services/redux/moneySlice";
import { useAppSelector } from "../../services/redux/store";
import { Balance } from "../../types";

interface AccountsHistoryGraphProps {
    bankAccounts: number[];
}

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

export default function AccountsDoughnutGraph({ bankAccounts }: AccountsHistoryGraphProps) {
  const [balances, setBalances] = useState<Balance[]>([]);
  const currencyRates = useAppSelector(getCurrencyRates);

  const format = (value: number, currency: string) => new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);

  useEffect(() => {
    let active = true;
    load();
    return () => {
      active = false;
    };

    async function load() {
      const res = await apiHandler.getCurrentBalances();
      if (!active) {
        return;
      }
      setBalances(res);
    }
  }, []);

  const filteredBalances = useMemo(() => (
    balances
      .filter(b => bankAccounts.includes(b.id))
      .sort((a, b) => bankAccounts.indexOf(a.id) - bankAccounts.indexOf(b.id))
  ), [balances, bankAccounts]);
  const jsoned = JSON.stringify(filteredBalances);

  const [data, labels] = useMemo(() => {
    console.log("calculating AccountsDoughnutGraph");
    const sum = filteredBalances.reduce((total, acc) => total + acc.balance / currencyRates[acc.currency], 0.0);

    const _labels = filteredBalances.map(acc => {
      const percent = Math.round(acc.balance / currencyRates[acc.currency] / sum * 1000) / 10;
      return `${acc.name}: ${format(acc.balance, acc.currency)} (${percent}%)`;
    });

    const _data = {
      labels: filteredBalances.map(b => b.name),
      datasets: [{
        data: filteredBalances.map(b => b.balance / currencyRates[b.currency]),
        backgroundColor: filteredBalances.map(b => b.color),
      }],
    };

    return [_data, _labels];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jsoned, currencyRates]);

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
            label: (a) => labels[a.dataIndex],
          },
        },
      },
    }}
  />;
}
