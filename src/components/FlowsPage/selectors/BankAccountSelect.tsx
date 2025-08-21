import Form from "react-bootstrap/Form";
import { FormSelectProps } from "react-bootstrap/FormSelect";

import { getBankAccounts } from "../../../services/redux/moneySlice";
import { useAppSelector } from "../../../services/redux/store";

type BankAccountSelectProps = FormSelectProps

export default function BankAccountSelect(props: BankAccountSelectProps) {
  const accounts = useAppSelector(getBankAccounts)
    .toSorted((a, b) => a.name.localeCompare(b.name));

  return (
    <Form.Select {...props}>
      {accounts.map(account => (
        <option key={account.id} value={account.id}>
          {account.name}
        </option>
      ))}
    </Form.Select>
  );
}
