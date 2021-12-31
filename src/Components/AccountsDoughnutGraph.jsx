import React, { Component } from 'react';
import { Doughnut } from 'react-chartjs-2';

import { AppContext } from '../AppContext';


const CurrFormat = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' })


const options = {
    plugins: {
        legend: {
            position: 'right'
        },
        tooltip: {
            callbacks: {
              label: (a) => a.label+": "+CurrFormat.format(a.raw),
            }
        }
    }
}

class AccountsDoughnutGraph extends Component {

    static contextType = AppContext;

    constructor(props, context) {
        super(props);
        this.context = context;

        this.state = {
            data: this.createDataset([])
        }
        this.previous_accounts = [];
    }

    componentDidMount() {
        this.componentDidUpdate();
    }

    componentDidUpdate() {
        if (this.context.bank_accounts.length === 0) return;
        if (this.previous_accounts !== this.props.accounts) {
            this.constructData();
            this.previous_accounts = this.props.accounts;
        }
    }

    createDataset(accounts) {
        let names = [];
        let data = [];
        let colors = [];
        for (let acc of accounts) {
            names.push(acc.name)
            data.push(acc.balance)
            colors.push(acc.color);
        }
        return {
            labels: names,
            datasets: [{
                data: data,
                backgroundColor: colors
            }]
        }
    }

    constructData() {
        this.context.getCurrentBalances().then(balances => {
            if (balances.length === 0) return;
            balances = balances.filter(b => this.props.accounts.includes(b.id));
            this.setState({data: this.createDataset(balances)})
        })
    }

    render() {
        return (
            <>
                {this.state.data.datasets != null ?
                    <Doughnut data={this.state.data} style={{maxHeight: 400}} options={options} /> :
                    null
                }
            </>
        )
    }

}

export default AccountsDoughnutGraph;