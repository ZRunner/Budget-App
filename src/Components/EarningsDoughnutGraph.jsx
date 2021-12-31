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
              footer: (a) => a[0].dataset.label,
              label: (a) => a.label+": "+CurrFormat.format(a.raw),
            }
        }
    }
}

class EarningsDoughnutGraph extends Component {

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

    createDataset(earnings) {
        let names = [];
        let data_exp = [];
        let data_inc = [];
        let colors = [];
        for (let acc of earnings) {
            names.push(acc.name);
            data_exp.push(acc.expenses);
            data_inc.push(acc.incomes);
            colors.push(acc.color);
        }
        return {
            labels: names,
            datasets: [
            {
                label: 'Incomes',
                data: data_inc,
                backgroundColor: colors
            },
            {
                label: 'Expenses',
                data: data_exp,
                backgroundColor: colors
            },
            ]
        }
    }

    dateToStr(yourDate) {
        const offset = yourDate.getTimezoneOffset()
        yourDate = new Date(yourDate.getTime() - (offset*60*1000))
        return yourDate.toISOString().split('T')[0]
    }

    constructData() {
        // get beginning date
        const first_date = new Date();
        first_date.setMonth(first_date.getMonth() - this.props.count);
        this.context.getEarningsPerAccount(this.dateToStr(first_date)).then(res => {
            console.debug("received", res)
            if (res.length === 0) return;
            this.setState({data: this.createDataset(res)})
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


export default EarningsDoughnutGraph;