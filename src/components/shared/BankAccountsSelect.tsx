import { useEffect, useMemo } from "react";
import Select, { StylesConfig } from "react-select";
import chroma from 'chroma-js';
import { getBankAccounts } from "../../services/redux/moneySlice";
import { useAppDispatch, useAppSelector } from "../../services/redux/store";
import { getSelectedBankAccounts, getSelectionInitialized, setSelectedBankAccounts } from "../../services/redux/contextSlice";

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

export default function BankAccountsSelect() {
    const dispatch = useAppDispatch();
    const bank_accounts = useAppSelector(getBankAccounts);
    const selectedBankAccounts = useAppSelector(getSelectedBankAccounts);
    const isSelectionInitialized = useAppSelector(getSelectionInitialized);

    const options: Option[] = useMemo(() => (
        bank_accounts.map(acc => ({
            value: acc.id,
            label: acc.name,
            color: acc.color,
        }))
    ), [bank_accounts])

    useEffect(() => {
        if (!isSelectionInitialized) {
            dispatch(setSelectedBankAccounts({
                accounts: bank_accounts.map(acc => acc.id),
                isInit: true,
            }))
        }
    }, [options, isSelectionInitialized, bank_accounts, dispatch])

    const onChange = (values: readonly Option[]) => {
        const ids = values.map(opt => opt.value);
        dispatch(setSelectedBankAccounts({
            accounts: ids,
            isInit: false,
        }))
    }

    return <Select
        value={options.filter(opt => selectedBankAccounts.includes(opt.value))}
        onChange={onChange}
        options={options}
        styles={colourStyles}
        isMulti
    />
}