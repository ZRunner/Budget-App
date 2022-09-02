import React, { useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import { useTransferCommands } from '../../services/hooks';
import { getBankAccounts, getCurrencyRates } from '../../services/redux/moneySlice';
import { useAppSelector } from '../../services/redux/store';
import BankAccountSelect from './BankAccountSelect';

interface AddTransferFormProps {
    visible: boolean;
    onHide: () => void;
}

export default function AddTransferForm({ visible, onHide }: AddTransferFormProps) {
    const { addTransferCommand } = useTransferCommands();
    const accounts = useAppSelector(getBankAccounts);
    const currencyRates = useAppSelector(getCurrencyRates);

    const [inputs, setInputs] = useState({
        name: "",
        amount1: 0.0,
        amount2: 0.0,
        category: 10,
        from_account: 6,
        to_account: 3,
        date: new Date().toISOString().split('T')[0],
    })
    const [fixedAmounts, setFixedAmounts] = useState({ amount1: false, amount2: false })

    const [currency1, currency2]: (string | undefined)[] = useMemo(() => ([
        accounts.find(acc => acc.id === inputs.from_account)?.currency,
        accounts.find(acc => acc.id === inputs.to_account)?.currency
    ]), [accounts, inputs])

    const amount1Placeholder = useMemo(() => (
        new Intl.NumberFormat(undefined, { style: 'currency', currency: currency1 ?? "EUR" }).format(0.0)
    ), [currency1])

    const amount2Placeholder = useMemo(() => (
        new Intl.NumberFormat(undefined, { style: 'currency', currency: currency2 ?? "EUR" }).format(0.0)
    ), [currency2])

    const handleChangeString = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = event.target.id;
        const value = event.target.value;
        setInputs({ ...inputs, [id]: value })
    }
    const handleChangeAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = event.target.id;
        const value = Number(event.target.value);
        if (id === "amount1" && !fixedAmounts.amount2) {
            const amount2 = value * currencyRates[currency2 ?? "EUR"] / currencyRates[currency1 ?? "EUR"]
            setInputs({
                ...inputs,
                amount1: value,
                amount2: amount2
            })
        } else if (id === "amount2" && !fixedAmounts.amount1) {
            const amount1 = value * currencyRates[currency1 ?? "EUR"] / currencyRates[currency2 ?? "EUR"]
            setInputs({
                ...inputs,
                amount1: amount1,
                amount2: value,
            })
        } else {
            setInputs({ ...inputs, [id]: value })
        }
        setFixedAmounts({ ...fixedAmounts, [id]: value !== 0.0 })
    }
    const handleSelectNumberChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const id = event.target.id;
        const value = event.target.value;
        setInputs({ ...inputs, [id]: Number(value) })
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        addTransferCommand({
            ...inputs,
            amount: inputs.amount1,
            rate: inputs.amount2 / inputs.amount1
        })
        onHide();
    }

    return (
        <Modal show={visible} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>New transfer</Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3" controlId='name'>
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
                        <Form.Group as={Col} controlId="from_account">
                            <Form.Label>From Account</Form.Label>
                            <BankAccountSelect
                                value={inputs.from_account}
                                onChange={handleSelectNumberChange}
                            />
                        </Form.Group>

                        <Form.Group as={Col} controlId="to_account">
                            <Form.Label>To Account</Form.Label>
                            <BankAccountSelect
                                value={inputs.to_account}
                                onChange={handleSelectNumberChange}
                            />
                        </Form.Group>
                    </Row>

                    <Row className="mb-3">
                        <Form.Group as={Col} controlId='date'>
                            <Form.Label>Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={inputs.date}
                                onChange={handleChangeString}
                                required
                            />
                        </Form.Group>

                        <Form.Group as={Col} controlId='amount1'>
                            <Form.Label>{currency1 === currency2 ? "Amount" : "Orig. Amount"}</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder={amount1Placeholder}
                                step="0.01"
                                min="0.0"
                                value={Math.round(inputs.amount1 * 100) / 100}
                                onChange={handleChangeAmount}
                                required
                            />
                        </Form.Group>

                        {currency1 !== currency2 && (
                            <Form.Group as={Col} controlId='amount2'>
                                <Form.Label>Dest. amount</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder={amount2Placeholder}
                                    step="0.01"
                                    min="0.0"
                                    value={Math.round(inputs.amount2 * 100) / 100}
                                    onChange={handleChangeAmount}
                                    required
                                />
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
    )
}