import React, { Component } from 'react';
import { TiDelete } from 'react-icons/ti';
import { BsPencilFill } from 'react-icons/bs';
import { AppContext } from '../AppContext';
import { CategorySelect } from './MiscSelects';

import '../CSS/ExpenseItem.scss';

class ExpenseItem extends Component {

  static contextType = AppContext;

  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      name: props.expense.name,
      cost: props.expense.cost,
      date: props.expense.date,
      category: props.expense.category,
      account: props.expense.bank_account,
    }
    this.CurrFormat = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' })

    this.handleDeleteExpense = this.handleDeleteExpense.bind(this);
    this.handleEditButton = this.handleEditButton.bind(this);
    this.handleSaveExpense = this.handleSaveExpense.bind(this);
    this.handleCancelEdition = this.handleCancelEdition.bind(this);
    this.getColor = this.getColor.bind(this);
  }

  handleDeleteExpense() {
    this.context.dispatch({
      type: 'DELETE_FLOW',
      payload: this.props.expense.id
    })
  }

  handleEditButton() {
    this.setState({ isEditing: true });
  }

  handleSaveExpense() {
    this.context.dispatch({
      type: 'EDIT_FLOW',
      payload: {
        id: this.props.expense.id,
        name: this.state.name,
        cost: parseFloat(this.state.cost),
        date: this.state.date,
        category: this.state.category,
        bank_account: this.state.account,
      }
    })
    this.setState({ isEditing: false })
  }

  handleCancelEdition() {
    this.setState({
      isEditing: false,
      name: this.props.expense.name,
      cost: this.props.expense.cost,
      date: this.props.expense.date,
      category: this.props.expense.category,
      account: this.props.expense.bank_account,
    })
  }

  getColor() {
    return this.state.cost > 0 ? 'success' : 'danger';
  }

  formatDate(raw_date) {
    return new Date(raw_date).toLocaleDateString();
  }

  render() {
    return (
      <li className="expense-item list-group-item d-flex justify-content-between align-items-center">
        {this.state.isEditing ?
          <>
            <div className="d-flex">
              <input type="date" className="form-control form-control-sm" id="date" style={{ maxWidth: "9em" }} required
                value={this.state.date} onChange={e => this.setState({ date: e.target.value })} />
              <input type="text" className="form-control" style={{ maxWidth: "20em" }} required
                value={this.state.name} onChange={e => this.setState({ name: e.target.value })} />
              <CategorySelect style={{ maxWidth: "10em" }} value={this.state.category} onChange={e => this.setState({ category: parseInt(e.target.value) })}/>
            </div>

            <div className="d-flex">
              
              <input type="number" className="form-control" id="cost" step="0.01" style={{ maxWidth: "6em" }} required
                value={this.state.cost} onChange={e => this.setState({ cost: e.target.value })} />
              <button type="submit" className="btn btn-primary btn-sm ms-2 me-1" onClick={this.handleSaveExpense}>Save</button>
              <button type="submit" className="btn btn-danger btn-sm" onClick={this.handleCancelEdition}>Cancel</button>
            </div>
          </>
          : <>
            <div>
              <small className="fw-lighter text-secondary me-2">{this.formatDate(this.state.date)}</small>
              <span>{this.state.name}</span>
              <span className={`badge bg-secondary rounded-pill ms-2`}>
                {this.context.getAccount(this.state.account)?.name ?? '?'}
              </span>
            </div>

            <div>
              <small className="text-secondary me-2">{this.context.getCategory(this.state.category)?.name ?? '?'}</small>
              <span className={`badge bg-${this.getColor()} rounded-pill me-3`}>
                {this.CurrFormat.format(this.state.cost)}
              </span>
              <BsPencilFill className="edit-btn mx-1" size="1.3em" onClick={this.handleEditButton}/>
              <TiDelete className="delete-btn" size="1.5em" onClick={this.handleDeleteExpense}/>
            </div>
          </>}
      </li>
    )
  }
}

export default ExpenseItem;