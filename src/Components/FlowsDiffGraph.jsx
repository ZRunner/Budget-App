import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';

import { AppContext } from '../AppContext';


const CurrFormat = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' })

const options = {
  pointBackgroundColor: '#fff',
  radius: 3,
  parsing: false,
  normalized: true,
  spanGaps: true,
  plugins: {
    legend: {
      position: 'right'
    },
    tooltip: {
      mode: 'index',
      callbacks: {
        footer: (a) => "total: "+CurrFormat.format(a[0].raw.y + a[1].raw.y),
        label: (a) => a.dataset.label+": "+CurrFormat.format(a.raw.y),
      }
    }
  }
}

function createDataset(earnings, expenses) {
  return {
    datasets: [
      {
        label: 'Earnings',
        data: earnings,
        fill: true,
        borderColor: "#009926",
        backgroundColor: '#009900',
      },
      {
        label: 'Expenses',
        data: expenses,
        fill: true,
        borderColor: "#ff0040",
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