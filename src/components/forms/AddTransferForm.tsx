import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import { useTransferCommands } from '../../services/hooks';
import BankAccountSelect from './BankAccountSelect';

interface AddTransferFormProps {
    visible: boolean;
    onHide: () => void;
}

export default function AddTransferForm({ visible, onHide }: AddTransferFormProps) {
    const { addTransferCommand } = useTransferCommands();
    const [inputs, setInputs] = useState({
        name: "",
        amount: "",
        category: 10,
        from_account: 6,
        to_account: 3,
        date: new Date().toISOString().split('T')[0],
    })

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
        addTransferCommand({
            ...inputs,
            amount: Number(inputs.amount),
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
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Row className="mb-3">
                        <Form.Group as={Col} controlId="from_account">
                            <Form.Label>From Account</Form.Label>
                            <BankAccountSelect
                                value={inputs.from_account}
                                onChange={handleSelectChange}
                            />
                        </Form.Group>

                        <Form.Group as={Col} controlId="to_account">
                            <Form.Label>To Account</Form.Label>
                            <BankAccountSelect
                                value={inputs.to_account}
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

                        <Form.Group as={Col} controlId='amount'>
                            <Form.Label>Amount</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                value={inputs.amount}
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