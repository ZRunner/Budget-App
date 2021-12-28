import React, { Component } from 'react';

import ExpenseList from './Components/ExpenseList';
import AddExpenseForm from './Components/AddExpenseForm';

import {Button} from 'react-bootstrap';

class ExpensesPage extends Component {
    constructor(props) {
        super(props);
        this.expenseModal = React.createRef();
        this.transferModal = React.createRef();

        this.showExpenseModal = this.showExpenseModal.bind(this);
        this.showTransferModal = this.showTransferModal.bind(this);
    }

    showExpenseModal() {
        this.expenseModal.current.handleShow();
    }

    showTransferModal() {
        this.transferModal.current.handleShow();
    }

    render() {
        return (
            <>
            <AddExpenseForm ref={this.expenseModal} />

            <div>
                <span>
                    <Button variant="primary" onClick={this.showExpenseModal}>Add an expense</Button>
                </span>
                <span className="mx-1">
                    <Button variant="primary" onClick={this.showTransferModal} disabled>Add a transfer</Button>
                </span>
            </div>
            
            <h3 className="mt-3">Expenses</h3>
            <div className="row mt-3">
                <div className="col-sm">
                <ExpenseList/>
                </div>
            </div>
            </>
        )
    }
}

export default ExpensesPage;