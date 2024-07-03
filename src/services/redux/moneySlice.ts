import type { PayloadAction } from "@reduxjs/toolkit";
import { createSelector, createSlice } from "@reduxjs/toolkit";

import { BankAccount, Category, CurrencyRate, Flow, Transfer } from "../../types";

export interface MoneyState {
    budget: number;
    categories: Category[];
    bankAccounts: BankAccount[];
    flows: Flow[];
    transfers: Transfer[];
    currencyRates: CurrencyRate;
}

const initialState: MoneyState = {
  budget: 2000,
  flows: [],
  transfers: [],
  categories: [],
  bankAccounts: [],
  currencyRates: {},
};

const getSlice = (state: { money: MoneyState }) => state.money;

export const getFlows = createSelector(getSlice, state => state.flows);

export const getTransfers = createSelector(getSlice, state => state.transfers);

export const getBankAccounts = createSelector(getSlice, state => state.bankAccounts);

export const getCategories = createSelector(getSlice, state => state.categories);

export const getCurrencyRates = createSelector(getSlice, state => state.currencyRates);

/**
 * Get the total amount of currently owned money accross all acccounts
 */
export const getTotalBalance = createSelector(
  [getFlows, getTransfers, getBankAccounts, getCurrencyRates],
  (flows, transfers, bankAccounts, currencyRates) => {
    const initial = bankAccounts.reduce((total, account) => ( total += account.initialBalance * currencyRates[account.currency]), 0.0);
    const withFlows = flows.reduce((total, item) => (total += item.cost / currencyRates[item.currency]), initial);
    return transfers.reduce((total, item) => {
      const fromCurrency = bankAccounts.find(acc => acc.id === item.fromAccount)?.currency ?? "EUR";
      const toCurrency = bankAccounts.find(acc => acc.id === item.toAccount)?.currency ?? "EUR";
      if (fromCurrency === toCurrency) return total;
      const rate1 = currencyRates[fromCurrency];
      const rate2 = currencyRates[toCurrency];
      total -= item.amount / rate1 - item.amount * item.rate / rate2;
      return total;
    }, withFlows);
  }
);

/**
 * Get the amount of money spent, without counting incomes, accross all accounts
 */
export const getExpensesOnly = createSelector(
  getFlows,
  flows => flows.reduce((total, item) => (total + item.cost < 0 ? -item.cost : 0), 0)
);

/**
 * Get the amount of money earned, without counting spendings, accross all accounts
 */
export const getIncomesOnly = createSelector(
  getFlows,
  flows => flows.reduce((total, item) => (total + item.cost > 0 ? item.cost : 0), 0)
);

/**
 * Get the bank account associated to a given account ID
 */
export const getBankAccount = createSelector(
  [getBankAccounts, (_, accountId: number) => accountId],
  (accounts, accountId): BankAccount | undefined => accounts.find(acc => acc.id === accountId),
);

/**
 * Get the category associated to a given category ID
 */
export const getCategory = createSelector(
  [getCategories, (_, categoryId: number) => categoryId],
  (categories, categoryId): Category | undefined => categories.find(category => category.id === categoryId),
);

export const moneySlice = createSlice({
  name: "money",
  initialState,
  reducers: {
    addFlow: (state, action: PayloadAction<Omit<Flow, "currency">>) => {
      const bankAccount = state.bankAccounts.find(acc => acc.id === action.payload.bankAccount);
      if (bankAccount === undefined) {
        console.warn("Unable to find bank account", action.payload.bankAccount);
      }
      return {
        ...state,
        flows: state.flows.concat({
          ...action.payload,
          currency: bankAccount?.currency ?? "EUR",
        }),
      };
    },
    deleteFlow: (state, action: PayloadAction<number>) => ({
      ...state,
      flows: state.flows.filter(
        flow => flow.id !== action.payload
      ),
    }),
    editFlow: (state, action: PayloadAction<Flow>) => ({
      ...state,
      flows: state.flows.map(exp => (exp.id === action.payload.id ? action.payload : exp)),
    }),
    addTransfer: (state, action: PayloadAction<Transfer>) => ({
      ...state,
      transfers: state.transfers.concat(action.payload),
    }),
    deleteTransfer: (state, action: PayloadAction<number>) => ({
      ...state,
      transfers: state.transfers.filter(
        transfer => transfer.id !== action.payload
      ),
    }),
    setFlows: (state, action: PayloadAction<Flow[]>) => ({
      ...state,
      flows: action.payload,
    }),
    setTransfers: (state, action: PayloadAction<Transfer[]>) => ({
      ...state,
      transfers: action.payload,
    }),
    setCategories: (state, action: PayloadAction<Category[]>) => ({
      ...state,
      categories: action.payload,
    }),
    setBankAccounts: (state, action: PayloadAction<BankAccount[]>) => ({
      ...state,
      bankAccounts: action.payload,
    }),
    setCurrencyRates: (state, action: PayloadAction<CurrencyRate>) => ({
      ...state,
      currencyRates: action.payload,
    }),
  },
});

export const {
  addFlow,
  deleteFlow,
  editFlow,
  addTransfer,
  deleteTransfer,
  setFlows,
  setTransfers,
  setCategories,
  setBankAccounts,
  setCurrencyRates,
} = moneySlice.actions;

export default moneySlice.reducer;