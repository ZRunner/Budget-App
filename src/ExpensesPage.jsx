import React,  { Component } from 'react';

import ExpenseList from './Components/ExpenseList';
import AddExpenseForm from './Components/AddExpenseForm';

class ExpensesPage extends Component {
    render() {
        return (
            <>
            <h3 className="mt-3">Expenses</h3>
            <div className="row mt-3">
                <div className="col-sm">
                <ExpenseList/>
                </div>
            </div>

            <h3 className="mt-3">Add Expense</h3>
            <div className="row mt-3">
                <div className="col-sm">
                <AddExpenseForm/>
                </div>
            </div>
            </>
        )
    }
}

export default ExpensesPage;