import React, { Component } from 'react';
import { AppContext } from '../AppContext';
import { CategorySelect, AccountSelect } from './MiscSelects';

const initialState = {
  name: '',
  cost: '',
  category: 10,
  date: new Date().toISOString().split('T')[0],
  bank_account: 1
}

class AddExpenseForm extends Component {

  static contextType = AppContext;

  constructor (props) {
    super(props);
    this.state = {
      ...initialState
    }
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(event) {
    event.preventDefault();
    const expense = {
      name: this.state.name,
      cost: parseFloat(this.state.cost),
      category: parseInt(this.state.category),
      date: this.state.date,
      bank_account: parseInt(this.state.bank_account)
    }
    this.context.dispatch({
      type: 'ADD_FLOW',
      payload: expense
    })
    this.setState({
      ...initialState
    })
  }

  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <div className="row">
          <div className="col-sm-6">
            <label htmlFor="name">Name</label>  
            <input type="text" className="form-control" id="name" required
              value={this.state.name} onChange={e => this.setState({ name: e.target.value })}/>
          </div>

          <div className="col-sm-3">
            <label htmlFor="category">Category</label>
            <CategorySelect value={this.state.category} onChange={e => this.setState({ category: e.target.value })}/>
          </div>

          <div className="col-sm-3">
            <label htmlFor="cost">Cost</label>
            <input type="number" className="form-control" id="cost" step="0.01" required
              value={this.state.cost} onChange={e => this.setState({ cost: e.target.value })}/>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-3">
            <label htmlFor="date">Date</label>  
            <input type="date" className="form-control" id="date" required
              value={this.state.date} onChange={e => this.setState({ date: e.target.value })}/>
          </div>

          <div className="col-sm-3">
            <label htmlFor="account">Bank Account</label>  
            <AccountSelect value={this.state.bank_account} onChange={e => this.setState({ bank_account: e.target.value })}/>
          </div>
        </div>

        <div className="row">
          <div className="col-sm">
            <button type="submit" className="btn btn-primary mt-3">
              Save
            </button>
          </div>
        </div>
      </form>
    )
  }
}

export default AddExpenseForm;