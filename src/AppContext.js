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
        return this.state.expenses.reduce((total, item) => {
            return (total += item.cost);
          }, 0);
    }

    getAccount = (id) => {
        return this.state.bank_accounts.find(acc => acc.id === id);
    }

    getCategory = (id) => {
        return this.state.categories.find(acc => acc.id === id);
    }

    render() {
        return (
            <AppContext.Provider value={{...this.state, getExpensesOnly:this.getExpensesOnly, getIncomsOnly:this.getIncomsOnly, getBalance:this.getBalance, getAccount:this.getAccount, getCategory:this.getCategory, dispatch: this.dispatch}}>
                {this.props.children}
            </AppContext.Provider>
        )
    }
}