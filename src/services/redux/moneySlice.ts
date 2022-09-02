import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Category, BankAccount, Flow, Transfer, CurrencyRate } from '../../types';

export interface MoneyState {
    budget: number;
    categories: Category[];
    bank_accounts: BankAccount[];
    flows: Flow[];
    transfers: Transfer[];
    currencyRates: CurrencyRate;
}

const initialState: MoneyState = {
    budget: 2000,
    flows: [],
    transfers: [],
    categories: [],
    bank_accounts: [],
    currencyRates: {},
}

const getSlice = (state: { money: MoneyState }) => state.money;

export const getFlows = createSelector(getSlice, state => state.flows);

export const getTransfers = createSelector(getSlice, state => state.transfers);

export const getBankAccounts = createSelector(getSlice, state => state.bank_accounts);

export const getCategories = createSelector(getSlice, state => state.categories);

export const getCurrencyRates = createSelector(getSlice, state => state.currencyRates);

/**
 * Get the total amount of currently owned money accross all acccounts
 */
export const getBalance = createSelector(
    [getFlows, getBankAccounts],
    (flows, bank_accounts) => {
        const initial = bank_accounts.reduce((total, account) => {
            return total += account.initial_balance;
        }, 0.0)
        return flows.reduce((total, item) => {
            return (total += item.cost);
        }, initial);
    }
);

/**
 * Get the amount of money spent, without counting incomes, accross all accounts
 */
export const getExpensesOnly = createSelector(
    getFlows,
    flows => flows.reduce((total, item) => total + item.cost < 0 ? -item.cost : 0, 0)
)

/**
 * Get the amount of money earned, without counting spendings, accross all accounts
 */
export const getIncomesOnly = createSelector(
    getFlows,
    flows => flows.reduce((total, item) => total + item.cost > 0 ? item.cost : 0, 0)
)

/**
 * Get the bank account associated to a given account ID
 */
export const getBankAccount = createSelector(
    [getBankAccounts, (_, accountId: number) => accountId],
    (accounts, accountId): BankAccount | undefined => accounts.find(acc => acc.id === accountId),
)

/**
 * Get the category associated to a given category ID
 */
export const getCategory = createSelector(
    [getCategories, (_, categoryId: number) => categoryId],
    (categories, categoryId): Category | undefined => categories.find(category => category.id === categoryId),
)

export const moneySlice = createSlice({
    name: 'money',
    initialState,
    reducers: {
        addFlow: (state, action: PayloadAction<Omit<Flow, "currency">>) => {
            const bank_account = state.bank_accounts.find(acc => acc.id === action.payload.bank_account);
            if (bank_account === undefined) {
                console.warn("Unable to find bank account", action.payload.bank_account);
            }
            return {
                ...state,
                flows: state.flows.concat({
                    ...action.payload,
                    currency: bank_account?.currency ?? 'EUR'
                })
            }
        },
        deleteFlow: (state, action: PayloadAction<number>) => {
            return {
                ...state,
                flows: state.flows.filter(
                    flow => flow.id !== action.payload
                )
            }
        },
        editFlow: (state, action: PayloadAction<Flow>) => {
            return {
                ...state,
                flows: state.flows.map(exp => exp.id === action.payload.id ? action.payload : exp)
            }
        },
        addTransfer: (state, action: PayloadAction<Transfer>) => {
            return {
                ...state,
                transfers: state.transfers.concat(action.payload)
            }
        },
        deleteTransfer: (state, action: PayloadAction<number>) => {
            return {
                ...state,
                transfers: state.transfers.filter(
                    transfer => transfer.id !== action.payload
                )
            }
        },
        setFlows: (state, action: PayloadAction<Flow[]>) => {
            return {
                ...state,
                flows: action.payload,
            }
        },
        setTransfers: (state, action: PayloadAction<Transfer[]>) => {
            return {
                ...state,
                transfers: action.payload,
            }
        },
        setCategories: (state, action: PayloadAction<Category[]>) => {
            return {
                ...state,
                categories: action.payload,
            }
        },
        setBankAccounts: (state, action: PayloadAction<BankAccount[]>) => {
            return {
                ...state,
                bank_accounts: action.payload,
            }
        },
        setCurrencyRates: (state, action: PayloadAction<CurrencyRate>) => {
            return {
                ...state,
                currencyRates: action.payload,
            }
        },
    },
})

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