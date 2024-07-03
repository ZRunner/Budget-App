import chroma from "chroma-js";
import { useEffect, useMemo } from "react";
import Select, { StylesConfig } from "react-select";

import { getSelectedBankAccounts, getSelectionInitialized, setSelectedBankAccounts } from "../../services/redux/contextSlice";
import { getBankAccounts } from "../../services/redux/moneySlice";
import { useAppDispatch, useAppSelector } from "../../services/redux/store";

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
    ":hover": {
      backgroundColor: data.color,
      color: "white",
    },
  }),
};

export default function BankAccountsSelect() {
  const dispatch = useAppDispatch();
  const bankAccounts = useAppSelector(getBankAccounts);
  const selectedBankAccounts = useAppSelector(getSelectedBankAccounts);
  const isSelectionInitialized = useAppSelector(getSelectionInitialized);

  const options: Option[] = useMemo(() => (
    bankAccounts.map(acc => ({
      value: acc.id,
      label: acc.name,
      color: acc.color,
    }))
  ), [bankAccounts]);

  useEffect(() => {
    if (!isSelectionInitialized) {
      dispatch(setSelectedBankAccounts({
        accounts: bankAccounts.map(acc => acc.id),
        isInit: true,
      }));
    }
  }, [options, isSelectionInitialized, bankAccounts, dispatch]);

  const onChange = (values: readonly Option[]) => {
    const ids = values.map(opt => opt.value);
    dispatch(setSelectedBankAccounts({
      accounts: ids,
      isInit: false,
    }));
  };

  return <Select
    value={options.filter(opt => selectedBankAccounts.includes(opt.value))}
    onChange={onChange}
    options={options}
    styles={colourStyles}
    isMulti
  />;
}