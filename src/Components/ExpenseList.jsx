import React from 'react';
import ExpenseItem from './ExpenseItem';
import ExpenseTransfer from './ExpenseTransfer';
import { AppContext } from '../AppContext';

function equalsArrays(a, b) {
  return a.length === b.length &&
  a.every(function (element) {
    return b.findIndex(eb => JSON.stringify(element) === JSON.stringify(eb)) > -1
  });
}


class ExpenseList extends React.Component {

  static contextType = AppContext;

  constructor (props, context) {
    super(props);
    this.currentExpenses = context.expenses.concat(context.transfers);
    this.state = {
      filteredExpenses: this.currentExpenses
    }

    this.handleChange = this.handleChange.bind(this);
  }

  // trigger list refresh when context expenses change
  componentDidUpdate() {
    const new_expenses = this.context.expenses.concat(this.context.transfers);
    if (!equalsArrays(new_expenses, this.currentExpenses)) {
      this.currentExpenses = new_expenses;
      this.setState({
        filteredExpenses: new_expenses
      })
    }
  }

  handleChange(event) {
    const searchResult = this.context.expenses.filter(
      (exp) => exp.name.toLowerCase().includes(event.target.value) || this.context.getAccount(exp.account)?.name.toLowerCase().includes(event.target.value)
    )
    this.setState({ filteredExpenses: searchResult });
  }

  sortDates(a, b) {
    return new Date(b.date) - new Date(a.date);
  }

  render() {
    return (
      <>
        <input type="text" className="form-control mb-2 mr-sm-2" placeholder="Type to search..."
          onChange={this.handleChange}/>
        <ul className="list-group">
          {
            this.state.filteredExpenses.sort(this.sortDates).map((expense) => {
              if (expense.from_account) { // it is a transfer
                return <ExpenseTransfer key={expense.id+"t"} expense={expense} />
              } else { // it is a normal expense
                return <ExpenseItem key={expense.id} expense={expense} />
              }
            })
          }
        </ul>
      </>
    )
  }
}

export default ExpenseList;