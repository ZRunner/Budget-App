import { useMemo } from "react";

import { getBankAccounts, getCurrencyRates, getFlows, getTotalBalance, getTransfers } from "../services/redux/moneySlice";
import { useAppSelector } from "../services/redux/store";

interface SummaryBoxProps {
    id: "total" | "1month" | "6months";
}

export default function SummaryBox({ id }: SummaryBoxProps) {
  const flows = useAppSelector(getFlows);
  const transfers = useAppSelector(getTransfers);
  const bankAccounts = useAppSelector(getBankAccounts);
  const totalBalance = useAppSelector(getTotalBalance);
  const currencyRates = useAppSelector(getCurrencyRates);

  const name = useMemo(() => {
    switch (id) {
    case "total":
      return "Current total";
    case "1month":
      return "1 month earnings";
    case "6months":
      return "6 months earnings";
    }
  }, [id]);

  const format = (value: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(value);

  const value = useMemo(() => {
    function getDeltaMonths(count: number) {
      // get beginning date
      const firstDate = new Date();
      firstDate.setMonth(firstDate.getMonth() - count);
      // filter interesting values and sum them
      const result = flows.filter(
        exp => new Date(exp.date) >= firstDate
      ).reduce((total, item) =>
        total + item.cost / currencyRates[item.currency]
      , 0.0);
      // add transfers
      return transfers.filter(
        exp => new Date(exp.date) >= firstDate
      ).reduce((total, item) => {
        const fromCurrency = bankAccounts.find(acc => acc.id === item.fromAccount)?.currency ?? "EUR";
        const toCurrency = bankAccounts.find(acc => acc.id === item.toAccount)?.currency ?? "EUR";
        if (fromCurrency === toCurrency) return total;
        const rate1 = currencyRates[fromCurrency];
        const rate2 = currencyRates[toCurrency];
        total -= item.amount / rate1 - item.amount * item.rate / rate2;
        return total;
      }, result);
    }

    switch (id) {
    case "total":
      return totalBalance;
    case "1month":
      return getDeltaMonths(1);
    case "6months":
      return getDeltaMonths(6);
    }
  }, [id, totalBalance, flows, transfers, bankAccounts, currencyRates]);

  const color = useMemo(() => {
    if (value < 0) {
      return "danger";
    } else if (value < 40) {
      return "warning";
    } else if (value < 80) {
      return "secondary";
    } else {
      return "success";
    }
  }, [value]);

  return <div className={`alert alert-${color}`}>
    <span>{name}: {format(value)}</span>
  </div>;
}