import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';

import { AppContext } from '../AppContext';

const options = {
  pointBackgroundColor: '#fff',
  radius: 5,
}

function createDataset(earnings, expenses) {
  return {
    datasets: [
      {
        label: 'Earnings',
        data: earnings,
        fill: true,
        backgroundColor: '#009900',
      },
      {
        label: 'Expenses',
        data: expenses,
        fill: true,
        backgroundColor: '#ff0066',
      },
    ],
  }
}

class FlowDiffGraph extends Component {

  static contextType = AppContext

  constructor(props, context) {
    super(props);
    this.context = context;

    this.state = {
      data: createDataset([], [])
    }
    this.previous_expenses = [];
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    if (this.previous_expenses !== this.context.expenses) {
      this.constructData();
      this.previous_expenses = this.context.expenses;
    }
  }

  formatDate(raw_date) {
    return new Date(raw_date).toLocaleDateString();
  }

  constructData() {
    let day = new Date(this.props.startDate);
    let today = this.props.endDate ? new Date(this.props.endDate) : new Date();
    let expensesData = [];
    let earningsData = [];

    while (day < today) {
      const flows = this.context.getFlowsOfDay(day);
      let earned = 0.0
      let spent = 0.0
      for (const flow of flows) {
        if (flow.cost > 0) earned += flow.cost;
        else spent += flow.cost;
      }

      expensesData.push({
        x: this.formatDate(day),
        y: spent
      })
      earningsData.push({
        x: this.formatDate(day),
        y: earned
      })

      day.setDate(day.getDate() + 1);
    }

    this.setState({
      data: createDataset(earningsData, expensesData)
    })
  }

  render() {
    return (
      <Line data={this.state.data} options={options} />
    )
  }
}

export default FlowDiffGraph;