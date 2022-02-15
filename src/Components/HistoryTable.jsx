import React, { Component } from 'react';
import { FaEquals, FaArrowDown, FaArrowUp } from 'react-icons/fa';

import { AppContext } from '../AppContext';
import '../CSS/HistoryTable.scss';

class HistoryTable extends Component {

    static contextType = AppContext

    constructor(props) {
        super(props);
        this.current_accounts = props.accounts;

        this.state = {
            history: []
        }
        this.CurrFormat = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' })
        
    }

    componentDidMount() {
        this.setState({ history: this.constructHistory()})
    }

    componentDidUpdate() {       
        if (this.props.accounts !== this.current_accounts) {
            this.setState({ history: this.constructHistory()})
            this.current_accounts = this.props.accounts;
        }
    }

    getMinDate() {
        var date = new Date();
        date.setFullYear(date.getFullYear() - 1);
        return date
    }

    constructHistory() {
        let dayState = new Map(this.context.bank_accounts.map(acc => [acc.id, acc.initial_balance]))
        let today = this.props.endDate ? new Date(this.props.endDate) : new Date();
        let day = new Date(Math.max(this.getMinDate(), new Date(this.props.startDate)));
        let result = [];

        const getTotal = (bal) => {
            let total = 0;
            bal.forEach((val, i) => {
                if (this.props.accounts.includes(i)) { total += val; }
            })
            return total;
        }

        let prev_result = getTotal(dayState);
        let prev_dat = new Date(day);

        let i = 0;
        while (day < today && i < 400) {
            for (let exp of this.context.getFlowsOfDay(day)) {
                if (this.props.accounts.includes(exp.bank_account)) {
                    dayState.set(exp.bank_account, dayState.get(exp.bank_account)+exp.cost);
                }
            }
            for (let exp of this.context.getTransfersOfDay(day)) {
                if (this.props.accounts.includes(exp.from_account)) {
                    dayState.set(exp.from_account, dayState.get(exp.from_account)-exp.amount);
                }
                if (this.props.accounts.includes(exp.to_account)) {
                    dayState.set(exp.to_account, dayState.get(exp.to_account)+exp.amount);
                }
            }
            if (day.getMonth() !== prev_dat.getMonth()) {
                result.push({
                    txt: prev_dat.toLocaleDateString(undefined, {month: 'long', year: 'numeric'}),
                    id: day.getMonth() + "-" + day.getFullYear()
                })
                prev_dat = new Date(day);
            }

            const total = getTotal(dayState)
            result.push({
                id: this.formatDate(day),
                day: new Date(day),
                bal: new Map(dayState),
                total: total,
                diff: total - prev_result
            })
            day.setDate(day.getDate() + 1);
            i++;
            prev_result = total;
        }
        return result.reverse();
    }

    formatDate(raw_date) {
        return new Date(raw_date).toLocaleDateString();
    }

    render() {
        return (
            <table className="history-table table table-striped table-sm">
                <thead className="table-light">
                    <tr>
                        <th scope="col">Date</th>
                        {this.props.accounts.map(id => (
                            <th key={id} scope="col">{this.context.getAccount(id)?.name}</th>
                        ))}
                        <th scope="col">Total</th>
                        <th scope="col">Modification</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.history.map(row => (
                        row.txt ?
                        <tr key={row.id} className="table-primary">
                            <td colSpan={this.props.accounts.length + 3}>
                                {row.txt}
                            </td>
                        </tr>   :
                        <tr key={row.id}>
                            <td>{this.formatDate(row.day)}</td>

                            {this.props.accounts.map(i => (
                                <td key={i}>{this.CurrFormat.format(row.bal.get(i))}</td>
                            ))}

                            <td>{this.CurrFormat.format(row.total)}</td>
                            
                            {row.diff > 0 ?
                                
                                <td className="diff-up"><FaArrowUp/> {this.CurrFormat.format(row.diff)}</td> : (
                                row.diff < 0 ?
                                
                                <td className="diff-down"><FaArrowDown/> {this.CurrFormat.format(row.diff)}</td> : 
                                
                                <td className="diff-equ"><FaEquals size="1em"/> {this.CurrFormat.format(row.diff)}</td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        )
    }
}


export default HistoryTable;