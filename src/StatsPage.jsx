import React, { Component } from 'react';
import LazyLoad from 'react-lazyload';

import { AccountsSelect } from './Components/MiscSelects';
import FlowDiffGraph from './Components/FlowsDiffGraph';
import AccountsHistoryGraph from './Components/AccountsHistoryGraph';
import AccountsDoughnutGraph from './Components/AccountsDoughnutGraph';
import EarningsDoughnutGraph from './Components/EarningsDoughnutGraph';

import './CSS/StatsPage.scss';

class StatsPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            accounts: []
        }
        this.onSelectChange = this.onSelectChange.bind(this);
    }

    onSelectChange(accounts) {
        this.setState({accounts});
    }

    render() {
        return (
            <div id="statspage">
            <h3 className="mt-3">Statistics</h3>

            <div className="row mt-3 mb-2">
                <label className="col-form-label">Select accounts:</label>
                <AccountsSelect onUpdate={this.onSelectChange} />
            </div>
                <h4>Expenses and Incomes history</h4>
                <LazyLoad style={{minHeight: 500}}>
                <FlowDiffGraph startDate="2021-09-01" />
                </LazyLoad>
    
                <h4>Balances history</h4>
                <LazyLoad style={{minHeight: 400}}>
                <AccountsHistoryGraph startDate="2021-09-01" accounts={this.state.accounts.map(acc => parseInt(acc.value))} />
                </LazyLoad>

                <h4>Current balance repartition</h4>
                <LazyLoad style={{minHeight: 400}}>
                <AccountsDoughnutGraph accounts={this.state.accounts.map(acc => parseInt(acc.value))} />
                </LazyLoad>

                <h4>Expenses and Incomes repartition (2 months)</h4>
                <LazyLoad style={{minHeight: 400}}>
                <EarningsDoughnutGraph accounts={this.state.accounts.map(acc => parseInt(acc.value))} count={2} />
                </LazyLoad>
            </div>
        )
    }
}

export default StatsPage;