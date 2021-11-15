import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import Select from 'react-select'

export const CategorySelect = (props) => {

    const context = useContext(AppContext);

    return (
        <select className="form-select" required {...props}>
            {context.categories.map(category => (
                <option key={category.id} value={category.id}>
                    {category.name}
                </option>
            ))}
        </select>
    )
}

export const AccountSelect = (props) => {

    const context = useContext(AppContext);

    return (
        <select className="form-select" required {...props}>
            {context.bank_accounts.map(account => (
                <option key={account.id} value={account.id}>
                    {account.name}
                </option>
            ))}
        </select>
    )
}

export class AccountsSelect extends React.Component {

    static contextType = AppContext;

    constructor(props, context) {
        super(props);
        this.context = context;

        const opt = this.getOptions();
        this.state = {
            selectedAccounts: opt,
            options: opt
        }
        this.props.onUpdate(this.state.selectedAccounts);

        this.handleChange = this.handleChange.bind(this);
        this.initializedAccounts = false;
        this.saved_bank_accounts = this.context.bank_accounts;
    }

    componentDidUpdate() {
        if (this.context.bank_accounts !== this.saved_bank_accounts) {
            this.setState({options: this.getOptions()}, () => {
                this.props.onUpdate(this.state.selectedAccounts);
            })
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
        if (this.props.onUpdate) {
            this.props.onUpdate(new_array);
        }
    }

    render() {
        return (
            <Select options={this.state.options} isMulti={true} value={this.state.selectedAccounts} onChange={this.handleChange} {...this.props} />
        )
    }

}