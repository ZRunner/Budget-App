import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";


export interface ContextState {
    selected_bank_accounts: number[];
    is_selection_initialized: boolean;
}

const initialState: ContextState = {
    selected_bank_accounts: [],
    is_selection_initialized: false,
}

const getSlice = (state: { context: ContextState }) => state.context;

export const getSelectedBankAccounts = createSelector(getSlice, state => state.selected_bank_accounts);

export const getSelectionInitialized = createSelector(getSlice, state => state.is_selection_initialized);


export const contextSlice = createSlice({
    name: "context",
    initialState,
    reducers: {
        setSelectedBankAccounts: (state, action: PayloadAction<{ accounts: number[], isInit: boolean }>) => {
            return {
                ...state,
                selected_bank_accounts: action.payload.accounts,
                is_selection_initialized: action.payload.isInit || state.is_selection_initialized,
            }
        }
    }
})

export const {
    setSelectedBankAccounts,
} = contextSlice.actions;

export default contextSlice.reducer;
