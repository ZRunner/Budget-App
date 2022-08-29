import { useState, useCallback } from 'react';
import BankAccountsSelect from '../components/forms/BankAccountsSelect';
import HistoryTable from '../components/HistoryTable';


export default function HistoryPage() {
    const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);

    const handleSelectChange = useCallback((values: readonly { value: number }[]) => {
        setSelectedAccounts(values.map(value => value.value));
    }, [])

    return (
        <>
            <h3 className="mt-3">Accounts history</h3>

            <div className="row mt-3 mb-2">
                <label className="col-form-label">Select accounts:</label>
                <BankAccountsSelect onChange={handleSelectChange} />
            </div>

            <div className="row ">
                <div className="col-sm table-responsive" style={{ maxHeight: '95vh' }}>
                    {selectedAccounts.length === 0 ?
                        <div className="alert alert-danger">Please select at least one account to show</div> :
                        <HistoryTable
                            bankAccounts={selectedAccounts}
                            startDate="2021-01-01"
                        />
                    }
                </div>
            </div>
        </>
    )
}