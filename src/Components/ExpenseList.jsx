import React from 'react';
import ExpenseItem from './ExpenseItem';
import { AppContext } from '../AppContext';

class ExpenseList extends React.Component {

  static contextType = AppContext;

  constructor (props, context) {
    super(props);
    this.currentExpenses = context.expenses;
    this.state = {
      filteredExpenses: context.expenses
    }

    this.handleChange = this.handleChange.bind(this);
  }

  // trigger list refresh when context expenses change
  componentDidUpdate() {
    if (this.context.expenses !== this.currentExpenses) {
      this.currentExpenses = this.context.expenses;
      this.setState({
        filteredExpenses: this.context.expenses
      })
    }
  }

  handleChange(event) {
    const searchResult = this.context.expenses.filter(
      (exp) => exp.name.toLowerCase().includes(event.target.value) || this.context.getAccount(exp.account)?.name.toLowerCase().includes(event.target.value)
    )
    this.setState({ filteredExpenses: searchResult });
  }

  render() {
    return (
      <>
        <input type="text" className="form-control mb-2 mr-sm-2" placeholder="Type to search..."
          onChange={this.handleChange}/>
        <ul className="list-group">
          {
            this.state.filteredExpenses.map((expense) => (
              <ExpenseItem key={expense.id} expense={expense} />
            ))
          }
        </ul>
      </>
    )
  }
}

export default ExpenseList;