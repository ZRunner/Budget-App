import { useMemo } from 'react';
import { getTotalBalance, getCurrencyRates, getFlows } from '../services/redux/moneySlice';
import { useAppSelector } from '../services/redux/store';

interface SummaryBoxProps {
    id: "total" | "1month" | "6months";
}

export default function SummaryBox({ id }: SummaryBoxProps) {
    const flows = useAppSelector(getFlows);
    const total = useAppSelector(getTotalBalance);
    const currency_rates = useAppSelector(getCurrencyRates);

    const name = useMemo(() => {
        switch (id) {
            case "total":
                return "Current total";
            case "1month":
                return "1 month earnings";
            case "6months":
                return "6 months earnings";
        }
    }, [id])

    const format = (value: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(value);

    const value = useMemo(() => {
        function getDeltaMonths(count: number) {
            // get beginning date
            const first_date = new Date();
            first_date.setMonth(first_date.getMonth() - count);
            // filter interesting values and sum them
            return flows.filter(
                exp => new Date(exp.date) >= first_date
            ).reduce((total, item) =>
                total + item.cost / currency_rates[item.currency]
                , 0.0);
        }

        switch (id) {
            case "total":
                return total;
            case "1month":
                return getDeltaMonths(1);
            case "6months":
                return getDeltaMonths(6);
        }
    }, [id, total, flows])

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
    }, [value])

    return <div className={`alert alert-${color}`}>
        <span>{name}: {format(value)}</span>
    </div>
}