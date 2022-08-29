import { useEffect, useMemo } from "react";
import Select, { StylesConfig } from "react-select";
import chroma from 'chroma-js';
import { getBankAccounts } from "../../services/redux/moneySlice";
import { useAppSelector } from "../../services/redux/store";

interface BankAccountsSelectProps {
    onChange: (values: readonly Option[]) => void;
}

interface Option {
    value: number;
    label: string;
    color: string;
}

const colourStyles: StylesConfig<Option> = {
    multiValue: (styles, { data }) => {
        const color = chroma(data.color);
        return {
            ...styles,
            backgroundColor: color.alpha(0.1).css(),
        };
    },
    multiValueLabel: (styles, { data }) => ({
        ...styles,
        color: data.color,
    }),
    multiValueRemove: (styles, { data }) => ({
        ...styles,
        color: data.color,
        ':hover': {
            backgroundColor: data.color,
            color: 'white',
        },
    }),
};

export default function BankAccountsSelect({ onChange }: BankAccountsSelectProps) {
    const bank_accounts = useAppSelector(getBankAccounts);

    const options: Option[] = useMemo(() => (
        bank_accounts.map(acc => ({
            value: acc.id,
            label: acc.name,
            color: acc.color,
        }))
    ), [bank_accounts])

    useEffect(() => { onChange(options) }, [options, onChange])

    return <Select
        defaultValue={options}
        options={options}
        onChange={onChange}
        styles={colourStyles}
        isMulti
    />
}