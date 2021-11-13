import React, { useContext } from 'react';
import { AppContext } from '../AppContext';

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
