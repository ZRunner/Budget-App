import { Suspense, useState, lazy, useCallback } from 'react';
import BankAccountsSelect from '../components/forms/BankAccountsSelect';
import AccountsDoughnutGraph from '../components/graphs/AccountsDoughnutGraph';
import AccountsHistoryGraph from '../components/graphs/AccountsHistoryGraph';
import EarningsDoughnutGraph from '../components/graphs/EarningsDoughnutGraph';
import '../css/StatsPage.scss';

const FlowDiffGraph = lazy(() => import('../components/graphs/FlowDiffGraph'));


export function StatsPage() {
    const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);

    const handleSelectChange = useCallback((values: readonly { value: number }[]) => {
        setSelectedAccounts(values.map(value => value.value));
    }, [])

    return (
        <div id="statspage">
            <h3 className="mt-3">Statistics</h3>

            <div className="row mt-3 mb-2">
                <label className="col-form-label">Select accounts:</label>
                <BankAccountsSelect onChange={handleSelectChange} />
            </div>

            <h4>Expenses and Incomes history</h4>
            <Suspense>
                <FlowDiffGraph startDate="2021-09-01" bankAccounts={selectedAccounts} />
            </Suspense>

            <h4>Balances history</h4>
            <Suspense>
                <AccountsHistoryGraph startDate="2021-09-01" bankAccounts={selectedAccounts} />
            </Suspense>

            <h4>Current balance repartition</h4>
            <Suspense>
                <AccountsDoughnutGraph bankAccounts={selectedAccounts} />
            </Suspense>

            <h4>Expenses and Incomes repartition (2 months)</h4>
            <Suspense>
                <EarningsDoughnutGraph bankAccounts={selectedAccounts} monthsCount={2} />
            </Suspense>
        </div>
    )
}