import { FormSelectProps } from 'react-bootstrap/FormSelect';
import Form from 'react-bootstrap/Form';
import { getBankAccounts } from '../../services/redux/moneySlice';
import { useAppSelector } from '../../services/redux/store';

interface BankAccountSelectProps extends FormSelectProps { }

export default function BankAccountSelect(props: BankAccountSelectProps) {
    const accounts = useAppSelector(getBankAccounts);

    return (
        <Form.Select {...props}>
            {accounts.map(account => (
                <option key={account.id} value={account.id}>
                    {account.name}
                </option>
            ))}
        </Form.Select>
    )
}
