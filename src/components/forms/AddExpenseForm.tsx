import React, { useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import { useFlowCommands } from '../../services/hooks';
import { getBankAccounts } from '../../services/redux/moneySlice';
import { useAppSelector } from '../../services/redux/store';
import BankAccountSelect from './BankAccountSelect';
import CategorySelect from './CategorySelect';

interface AddExpenseFormProps {
    visible: boolean;
    onHide: () => void;
}

export default function AddExpenseForm({ visible, onHide }: AddExpenseFormProps) {
    const { addFlowCommand } = useFlowCommands();
    const accounts = useAppSelector(getBankAccounts);

    const [inputs, setInputs] = useState({
        name: "",
        cost: "",
        category: 10,
        bank_account: 3,
        date: new Date().toISOString().split('T')[0],
    })

    const amountPlaceholder = useMemo(() => {
        const account = accounts.find(acc => acc.id === inputs.bank_account)?.currency;
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: account ?? "EUR" }).format(0.0)
    }, [inputs.bank_account])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = event.target.id;
        const value = event.target.value;
        setInputs({ ...inputs, [id]: value })
    }
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const id = event.target.id;
        const value = event.target.value;
        setInputs({ ...inputs, [id]: Number(value) })
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        addFlowCommand({
            ...inputs,
            cost: Number(inputs.cost),
        })
        onHide();
    }

    return (
        <Modal show={visible} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>New expense</Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3" controlId='name'>
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="The expense or income label"
                            value={inputs.name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Row className="mb-3">
                        <Form.Group as={Col} controlId="category">
                            <Form.Label>Category</Form.Label>
                            <CategorySelect
                                value={inputs.category}
                                onChange={handleSelectChange}
                            />
                        </Form.Group>

                        <Form.Group as={Col} controlId="bank_account">
                            <Form.Label>Bank Account</Form.Label>
                            <BankAccountSelect
                                value={inputs.bank_account}
                                onChange={handleSelectChange}
                            />
                        </Form.Group>
                    </Row>

                    <Row className="mb-3">
                        <Form.Group as={Col} controlId='date'>
                            <Form.Label>Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={inputs.date}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group as={Col} controlId='cost'>
                            <Form.Label>Amount</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder={amountPlaceholder}
                                step="0.01"
                                value={inputs.cost}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
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