import React, { createContext } from 'react';
import apiHandler from './Database';

const AsyncReducer = (state, action) => {
    console.debug(`dispatching ${action.type}`, action.payload)
    return new Promise(resolve => {
        switch (action.type) {
            case 'ADD_FLOW':
                apiHandler.addFlow(action.payload).then(new_id => {
                    if (new_id) {
                        action.payload.id = new_id
                        resolve({
                            ...state,
                            expenses: [...state.expenses, action.payload]})
                    } else {
                        resolve(state);
                    }
                })
                break;
            case 'DELETE_FLOW':
                apiHandler.deleteFlow(action.payload).then(isOk => {
                    if (isOk) {
                        resolve({
                            ...state,
                            expenses: state.expenses.filter(exp => exp.id !== action.payload)
                        })
                    } else {
                        resolve(state);
                    }
                })
                break;
            case 'EDIT_FLOW':
                apiHandler.editFlow(action.payload.id, action.payload).then(isOk => {
                    if (isOk) {
                        resolve({
                            ...state,
                            expenses: state.expenses.map(exp => exp.id === action.payload.id ? action.payload : exp)
                        })
                    } else {
                        resolve(state);
                    }
                })
                break;
            case 'SET_FLOWS':
                resolve({ ...state, expenses: action.payload })
                break;
            case 'SET_TRANSFERS':
                resolve({ ...state, transfers: action.payload })
                break;
            case 'ADD_TRANSFER':
                apiHandler.addTransfer(action.payload).then(new_id => {
                    if (new_id) {
                        action.payload.id = new_id
                        resolve({
                            ...state,
                            transfers: [...state.transfers, action.payload]})
                    } else {
                        resolve(state);
                    }
                })
                break;
            case 'SET_CATEGORIES':
                resolve({
                    ...state,
                    categories: action.payload
                })
                break;
            case 'SET_BANK_ACCOUNTS':
                resolve({
                    ...state,
                    bank_accounts: action.payload
                })
                break;
            default:
                resolve(state);
                break;
        }
    });
}

const initialState = {
    budget: 2000,
    expenses: [],
    transfers: [],
    categories: [],
    bank_accounts: []
}

export const AppContext = createContext();

export class AppProvider extends React.Component {

    constructor(props) {
        super(props);

        this.state = {...initialState};
        this.dispatch = (action) => AsyncReducer(this.state, action).then(res => {
            this.setState(res)
        });
    }


    // initial loading
    componentDidMount() {
        apiHandler.getFlows()
        .then(json => {
            return this.dispatch({
                type: 'SET_FLOWS',
                payload: json
            })
        })
        .then(() => apiHandler.getTransfers())
        .then(json => {
            return this.dispatch({
                type: 'SET_TRANSFERS',
                payload: json
            })
        })
        .then(() => apiHandler.getBankAccounts())
        .then(json => {
            return this.dispatch({
                type: 'SET_BANK_ACCOUNTS',
                payload: json
            })
        })
        .then(() => apiHandler.getCategories())
        .then(json => {
            return this.dispatch({
                type: 'SET_CATEGORIES',
                payload: json
            })
        })
    }

    getExpensesOnly = () => {
        return this.state.expenses.reduce((total, item) => {
            return (total += item.cost < 0 ? -item.cost : 0);
          }, 0);
    }

    getIncomsOnly = () => {
        return this.state.expenses.reduce((total, item) => {
            return (total += item.cost > 0 ? item.cost : 0);
          }, 0);
    }

    getBalance = () => {
        const initial = this.state.bank_accounts.reduce((total, account) => {
            return total += account.initial_balance;
        }, 0.0)
        return this.state.expenses.reduce((total, item) => {
            return (total += item.cost);
          }, initial);
    }

    getAccount = (id) => {
        return this.state.bank_accounts.find(acc => acc.id === id);
    }

    getCategory = (id) => {
        return this.state.categories.find(acc => acc.id === id);
    }

    getFlowsOfDay = (day) => {
        return this.state.expenses.filter(exp => {
            const d = new Date(exp.date)
            return d.getDate() === day.getDate() && d.getMonth() === day.getMonth() && d.getFullYear() === day.getFullYear();
        });
    }

    getTransfersOfDay = (day) => {
        return this.state.transfers.filter(exp => {
            const d = new Date(exp.date)
            return d.getDate() === day.getDate() && d.getMonth() === day.getMonth() && d.getFullYear() === day.getFullYear();
        });
    }

    render() {
        return (
            <AppContext.Provider value={{...this.state, getExpensesOnly:this.getExpensesOnly, getIncomsOnly:this.getIncomsOnly, getBalance:this.getBalance, getAccount:this.getAccount, getCategory:this.getCategory, dispatch:this.dispatch, getFlowsOfDay:this.getFlowsOfDay, getTransfersOfDay:this.getTransfersOfDay, getCurrentBalances:apiHandler.getCurrentBalances, getEarningsPerAccount:apiHandler.getEarningsPerAccount}}>
                {this.props.children}
            </AppContext.Provider>
        )
    }
}