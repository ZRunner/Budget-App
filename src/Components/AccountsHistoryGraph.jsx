import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';

import { AppContext } from '../AppContext';

const options = {
    pointBackgroundColor: '#fff',
    radius: 2,
    normalized: true,
    spanGaps: true,
    plugins: {
        legend: {
            position: 'right'
        }
    }
}

class AccountsHistoryGraph extends Component {

    static contextType = AppContext

    constructor(props, context) {
        super(props);
        this.context = context;

        this.state = {
            data: this.createDataset(new Map())
        }
        this.previous_expenses = [];
        this.previous_accounts = [];
    }

    componentDidMount() {
        this.componentDidUpdate();
    }

    componentDidUpdate() {
        if (this.context.bank_accounts.length === 0) return;
        if (this.previous_expenses !== this.context.expenses || this.previous_accounts !== this.props.accounts) {
            this.constructData();
            this.previous_expenses = this.context.expenses;
            this.previous_accounts = this.props.accounts;
        }
    }

    formatDate(raw_date) {
        return new Date(raw_date).toLocaleDateString();
    }

    getAccountsMap() {
        let result = new Map(this.props.accounts.map(id => [id, this.context.getAccount(id)]))
        result.set('total', { name: 'total', 'color': "#009926" })
        return result
    }

    createDataset(historics) {
        const accountsMap = this.getAccountsMap();
        let obj = { datasets: [] }
        for (let [acc_id, value] of historics) {
            const acc = accountsMap.get(acc_id)
            obj.datasets.push({
                label: acc.name,
                data: value,
                fill: false,
                borderColor: acc.color,
                backgroundColor: acc.color,
            })
        };
        return obj;
    }

    constructData() {
        const accountsMap = this.getAccountsMap();

        let day = new Date(this.props.startDate);
        let result = new Map(this.props.accounts.map(acc => [acc, []]))
        result.set('total', [])

        let balancePerAcc = new Map(this.props.accounts.map(acc => [
            acc,
            accountsMap.get(acc).initial_balance
        ]))
        let today = this.props.endDate ? new Date(this.props.endDate) : new Date();

        const addValue = (acc_name, day, value) => {
            let res = result.get(acc_name);
            res.push({
                x: this.formatDate(day),
                y: value
            })
        }

        while (day < today) {
            let dayDiff = new Map(this.props.accounts.map(acc => {
                return [acc, balancePerAcc.get(acc)]
            }))
            for (let exp of this.context.getFlowsOfDay(day)) {
                if (this.props.accounts.includes(exp.bank_account)) {
                    dayDiff.set(exp.bank_account, dayDiff.get(exp.bank_account) + exp.cost);
                }
            }

            let total = 0;
            dayDiff.forEach((value, acc) => {
                addValue(acc, day, value);
                balancePerAcc.set(acc, value);
                total += value
            })
            addValue('total', day, total);

            day.setDate(day.getDate() + 1);
        }

        this.setState({
            data: this.createDataset(result)
        });
    }

    render() {
        return (
            <>
                {this.state.data.datasets != null ?
                    <Line data={this.state.data} options={options} /> :
                    null
                }
            </>
        )
    }
}

export default AccountsHistoryGraph