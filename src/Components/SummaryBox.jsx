import React, { Component } from 'react';
import { AppContext } from '../AppContext';

class SummaryBox extends Component {

  static contextType = AppContext

  constructor(props, context) {
    super(props);
    this.context = context;
    this.state = {value: 0.0}
    this.CurrFormat = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' })
    this.saved_expenses = [];
    this.saved_balance = 0.0;

    this.getDeltaMonths = this.getDeltaMonths.bind(this);
  }

  componentDidUpdate() {
    if (this.context.expenses !== this.saved_expenses) {
      this.updateValue();
      this.saved_expenses = this.context.expenses;
    }
    if (this.props.id === "total" && this.saved_balance !== this.context.getBalance()) {
      this.updateValue();
      this.saved_balance = this.context.getBalance();
    }
  }

  getDeltaMonths(count) {
    // get beginning date
    let first_date = new Date();
    first_date.setMonth(first_date.getMonth() - count);
    // filter interesting values and sum them
    return this.context.expenses.filter(exp => {
      const d = new Date(exp.date)
      return d >= first_date;
    }).reduce((total, item) => {
      return (total += item.cost);
    }, 0.0);
  }

  updateValue() {
    switch (this.props.id) {
      case "total":
        this.setState({value: this.context.getBalance()});
        break;
      case "1month":
        this.setState({value: this.getDeltaMonths(1)});
        break;
      case "6months":
        this.setState({value: this.getDeltaMonths(6)});
        break;
      default:
        this.setState({value: 0.0});
    }
  }

  getColor() {
    if (this.state.value < 0) {
      return "danger"
    } else if (this.state.value < 30) {
      return "warning"
    } else if (this.state.value < 50) {
      return "secondary";
    } else {
      return "success"
    }
  }

  render() {
    return (
      <div className={`alert alert-${this.getColor()}`}>
        <span>{this.props.name}: {this.CurrFormat.format(this.state.value)}</span>
      </div>
    )
  }
}

export default SummaryBox;