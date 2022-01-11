import React, { Component } from 'react';
import { AppContext } from '../AppContext';
import { CategorySelect, AccountSelect } from './MiscSelects';

import {Modal, Button} from 'react-bootstrap';

const initialState = {
  name: '',
  amount: '',
  category: 10,
  from_account: 1,
  to_account: 1,
  date: new Date().toISOString().split('T')[0],
}

class AddTransferForm extends Component {

  static contextType = AppContext;

  constructor(props) {
    super(props);
    this.state = {
      show: false,
      ...initialState
    }
    this.onSubmit = this.onSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleshow = this.handleShow.bind(this);
  }

  onSubmit(event) {
    event.preventDefault();
    const transfer = {
      name: this.state.name,
      amount: parseFloat(this.state.cost),
      category: parseInt(this.state.category),
      from_account: parseInt(this.state.from_account),
      to_account: parseInt(this.state.to_account),
      date: this.state.date,
    }
    this.context.dispatch({
      type: 'ADD_TRANSFER',
      payload: transfer
    })
    this.setState({
      ...initialState
    })
    this.handleClose();
  }

  handleClose() {
    this.setState({show: false})
  }
  handleShow() {
    this.setState({show: true})
  }

  render() {
    return (
      <Modal show={this.state.show} onHide={this.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>New transfer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <div className="row">
          <div className="col-sm-12">
            <label htmlFor="name">Name</label>
            <input type="text" className="form-control" id="name" required
              value={this.state.name} onChange={e => this.setState({ name: e.target.value })} />
          </div>
        </div>

        <div className="row">
          <div className="col-sm-6">
            <label htmlFor="account">From Account</label>
            <AccountSelect value={this.state.from_account} onChange={e => this.setState({ from_account: e.target.value })} />
          </div>
          <div className="col-sm-6">
            <label htmlFor="account">To Account</label>
            <AccountSelect value={this.state.to_account} onChange={e => this.setState({ to_account: e.target.value })} />
          </div>
        </div>

        <div className="row">
          <div className="col-sm-6">
            <label htmlFor="date">Date</label>
            <input type="date" className="form-control" id="date" required
              value={this.state.date} onChange={e => this.setState({ date: e.target.value })} />
          </div>

          <div className="col-sm-6">
            <label htmlFor="cost">Amount</label>
            <input type="number" className="form-control" id="cost" step="0.01" required
              value={this.state.cost} onChange={e => this.setState({ cost: e.target.value })} />
          </div>
        </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={this.onSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

export default AddTransferForm;