import React, { Component } from 'react';
import { AppContext } from '../AppContext';

class SummaryBox extends Component {

  static contextType = AppContext

  constructor(props) {
    super(props);
    this.CurrFormat = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' })
  }

  getValue() {
    switch (this.props.id) {
      case "budget":
        return this.context.budget;
      case "spent":
        return -this.context.getBalance();
      case "remaining":
        return this.context.budget + this.context.getBalance();
      default:
        return 0.0
    }
  }

  getColor() {
    if (this.props.id === "spent" || this.props.id === "remaining") {
      const expenses = this.context.getBalance();
      if (this.context.budget < -expenses) {
        return "danger"
      } else if (expenses/this.context.budget < -0.9) {
        return "warning"
      } else if (expenses > 0) {
        return "success";
      } else {
        return "secondary"
      }
    }
    if (this.props.id === "budget") {
      return "info"
    }
    return "secondary"
  }

  render() {
    return (
      <div className={`alert alert-${this.getColor()}`}>
        <span>{this.props.name}: {this.CurrFormat.format(this.getValue())}</span>
      </div>
    )
  }
}

export default SummaryBox;