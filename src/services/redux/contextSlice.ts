import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";


export interface ContextState {
    selectedBankAccounts: number[];
    isSelectionInitialized: boolean;
}

const initialState: ContextState = {
  selectedBankAccounts: [],
  isSelectionInitialized: false,
};

const getSlice = (state: { context: ContextState }) => state.context;

export const getSelectedBankAccounts = createSelector(getSlice, state => state.selectedBankAccounts);

export const getSelectionInitialized = createSelector(getSlice, state => state.isSelectionInitialized);


export const contextSlice = createSlice({
  name: "context",
  initialState,
  reducers: {
    setSelectedBankAccounts: (state, action: PayloadAction<{ accounts: number[], isInit: boolean }>) => ({
      ...state,
      selectedBankAccounts: action.payload.accounts,
      isSelectionInitialized: action.payload.isInit || state.isSelectionInitialized,
    }),
  },
});

export const {
  setSelectedBankAccounts,
} = contextSlice.actions;

export default contextSlice.reducer;
