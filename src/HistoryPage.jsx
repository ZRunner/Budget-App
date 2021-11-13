import React, { Component } from 'react';
import Select from 'react-select'

import { AppContext } from './AppContext';
import HistoryTable from './Components/HistoryTable';


class HistoryPage extends Component {

    static contextType = AppContext;

    constructor(props, context) {
        super(props);
        this.context = context;

        const opt = this.getOptions();
        this.state = {
            selectedAccounts: opt,
            options: opt
        }

        this.handleChange = this.handleChange.bind(this);
        this.initializedAccounts = false;
        this.saved_bank_accounts = this.context.bank_accounts;        
    }

    componentDidUpdate() {
        if (this.context.bank_accounts !== this.saved_bank_accounts) {
            this.setState({options: this.getOptions()});
            this.saved_bank_accounts = this.context.bank_accounts;
        }
    }

    getOptions() {
        const options = Array.from(this.context.bank_accounts, acc => {return {
            value: acc.id,
            label: acc.name
        }})
        if (!this.initializedAccounts && options.length > 0) {
            this.setState({selectedAccounts: options});
            this.initializedAccounts = true;
        }
        return options;
    }

    handleChange(new_array) {
        this.setState({
            selectedAccounts: new_array
        })
    }

    render() {
        return (
            <>
            <h3 className="mt-3">Accounts history</h3>

            <div className="row mt-3 mb-2">
                <label className="col-form-label">Select accounts:</label>
                <Select options={this.state.options} isMulti={true} draggable={true} value={this.state.selectedAccounts} onChange={this.handleChange} />
            </div>

            <div className="row ">
                <div className="col-sm table-responsive" style={{maxHeight: '95vh'}}>
                    {this.state.selectedAccounts.length === 0 ? 
                    <div className="alert alert-danger">Please select at least one account to show</div>    :
                    <HistoryTable accounts={this.state.selectedAccounts.map(acc => parseInt(acc.value))}
                        startDate="2021-01-01"/>
                    }
                </div>
            </div>
            </>
        )
    }
}

export default HistoryPage;