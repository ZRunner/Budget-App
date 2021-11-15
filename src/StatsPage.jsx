import React,  { Component } from 'react';
import LazyLoad from 'react-lazyload';

import { AccountsSelect } from './Components/MiscSelects';
import FlowDiffGraph from './Components/FlowsDiffGraph';
import AccountsHistoryGraph from './Components/AccountsHistoryGraph';

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
            <>
            <h3 className="mt-3">Statistics</h3>

            <div className="row mt-3 mb-2">
                <label className="col-form-label">Select accounts:</label>
                <AccountsSelect onUpdate={this.onSelectChange} />
            </div>
                <LazyLoad style={{minHeight: 500}}>
                <FlowDiffGraph startDate="2021-09-01" />
                </LazyLoad>
    
                <LazyLoad style={{minHeight: 400}}>
                <AccountsHistoryGraph startDate="2021-09-01" accounts={this.state.accounts.map(acc => parseInt(acc.value))} />
                </LazyLoad>
            </>
        )
    }
}

export default StatsPage;