import React, { useMemo, useState } from "react";
import { InputGroup } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";

import { useTransferCommands } from "../../../services/hooks";
import { getBankAccounts, getCurrencyRates } from "../../../services/redux/moneySlice";
import { useAppSelector } from "../../../services/redux/store";
import BankAccountSelect from "../selectors/BankAccountSelect";

interface AddTransferFormProps {
    visible: boolean;
    onHide: () => void;
}

const amountPlaceholder = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2 }).format(0.0);

export default function AddTransferForm({ visible, onHide }: AddTransferFormProps) {
  const { addTransferCommand } = useTransferCommands();
  const accounts = useAppSelector(getBankAccounts);
  const currencyRates = useAppSelector(getCurrencyRates);

  const [inputs, setInputs] = useState({
    name: "",
    amount1: 0.0,
    amount2: 0.0,
    category: 10,
    fromAccount: 6,
    toAccount: 3,
    date: new Date().toISOString().split("T")[0],
  });
  const [fixedAmounts, setFixedAmounts] = useState({ amount1: false, amount2: false });

  const [outputAccountCurrency, inputAccountCurrency]: (string | undefined)[] = useMemo(() => ([
    accounts.find(acc => acc.id === inputs.fromAccount)?.currency ?? "EUR",
    accounts.find(acc => acc.id === inputs.toAccount)?.currency ?? "EUR",
  ]), [accounts, inputs]);
  const sameCurrencies = outputAccountCurrency === inputAccountCurrency;

  const handleChangeString = (event: React.ChangeEvent<HTMLInputElement>) => {
    const id = event.target.id;
    const value = event.target.value;
    setInputs({ ...inputs, [id]: value });
  };
  const handleChangeAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    const id = event.target.id;
    const value = Number(event.target.value);
    if (id === "amount1" && !fixedAmounts.amount2) {
      const amount2 = value * currencyRates[inputAccountCurrency ?? "EUR"] / currencyRates[outputAccountCurrency ?? "EUR"];
      setInputs({
        ...inputs,
        amount1: value,
        amount2: amount2,
      });
    } else if (id === "amount2" && !fixedAmounts.amount1) {
      const amount1 = value * currencyRates[outputAccountCurrency ?? "EUR"] / currencyRates[inputAccountCurrency ?? "EUR"];
      setInputs({
        ...inputs,
        amount1: amount1,
        amount2: value,
      });
    } else {
      setInputs({ ...inputs, [id]: value });
    }
    setFixedAmounts({ ...fixedAmounts, [id]: value !== 0.0 });
  };
  const handleSelectNumberChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const id = event.target.id;
    const value = event.target.value;
    setInputs({ ...inputs, [id]: Number(value) });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = {
      name: inputs.name,
      amount: inputs.amount1,
      rate: inputs.amount2 / inputs.amount1,
      category: inputs.category,
      fromAccount: inputs.fromAccount,
      toAccount: inputs.toAccount,
      date: inputs.date,
    };
    console.log(inputs, data);
    addTransferCommand(data);
    onHide();
  };

  return (
    <Modal show={visible} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>New transfer</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="The transfer label"
              value={inputs.name}
              onChange={handleChangeString}
              required
            />
          </Form.Group>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="fromAccount">
              <Form.Label>From Account</Form.Label>
              <BankAccountSelect
                value={inputs.fromAccount}
                onChange={handleSelectNumberChange}
              />
            </Form.Group>

            <Form.Group as={Col} controlId="toAccount">
              <Form.Label>To Account</Form.Label>
              <BankAccountSelect
                value={inputs.toAccount}
                onChange={handleSelectNumberChange}
              />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="date">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={inputs.date}
                onChange={handleChangeString}
                required
              />
            </Form.Group>

            <Form.Group as={Col} controlId="amount1">
              <Form.Label>{sameCurrencies ? "Amount" : "Orig. Amount"}</Form.Label>
              <InputGroup>
                <Form.Control
                  type="number"
                  placeholder={amountPlaceholder}
                  step="0.01"
                  min="0.0"
                  value={Math.round(inputs.amount1 * 100) / 100}
                  onChange={handleChangeAmount}
                  aria-describedby="transfer-output-amount"
                  required
                />
                <InputGroup.Text id="transfer-output-amount">{outputAccountCurrency}</InputGroup.Text>
              </InputGroup>
            </Form.Group>

            {!sameCurrencies && (
              <Form.Group as={Col} controlId="amount2">
                <Form.Label>Dest. amount</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    placeholder={amountPlaceholder}
                    step="0.01"
                    min="0.0"
                    value={Math.round(inputs.amount2 * 100) / 100}
                    onChange={handleChangeAmount}
                    aria-describedby="transfer-input-amount"
                    required
                  />
                  <InputGroup.Text id="transfer-input-amount">{inputAccountCurrency}</InputGroup.Text>
                </InputGroup>
              </Form.Group>
            )}

          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" type="submit">
                        Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}