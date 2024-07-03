import { useState } from "react";
import { InputGroup } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";

import { useFlowCommands } from "../../../services/hooks";
import { getBankAccounts } from "../../../services/redux/moneySlice";
import { useAppSelector } from "../../../services/redux/store";
import { Flow } from "../../../types";
import BankAccountSelect from "../selectors/BankAccountSelect";
import CategorySelect from "../selectors/CategorySelect";

export type FlowFormInputType = Omit<Flow, "id" | "currency"> & { id: number | undefined };
type InitialValueType = Omit<FlowFormInputType, "cost"> & { cost: number | undefined };

interface FlowFormProps {
  visible: boolean;
  onHide: () => void;
  initialValue: InitialValueType;
  onSubmit: (flow: FlowFormInputType) => void;
}

const amountPlaceholder = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2 }).format(0.0);

export default function FlowForm({ visible, onHide, initialValue, onSubmit }: FlowFormProps) {
  const [flow, setFlow] = useState(initialValue);
  const accounts = useAppSelector(getBankAccounts);

  const accountCurrency = accounts.find(acc => acc.id === flow.bankAccount)?.currency ?? "EUR";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const id = event.target.id;
    const value = event.target.value;
    setFlow({ ...flow, [id]: value });
  };
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const id = event.target.id;
    const value = event.target.value;
    setFlow({ ...flow, [id]: Number(value) });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      ...flow,
      cost: Number(flow.cost),
    });
  };

  const isNewFlow = flow.id === undefined;
  const modalTitle = isNewFlow ? "New expense" : `Edit expense #${flow.id}`;
  const submitLabel = isNewFlow ? "Add expense" : "Save changes";

  return (
    <Modal show={visible} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{modalTitle}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId='name'>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="The expense or income label"
              value={flow.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="category">
              <Form.Label>Category</Form.Label>
              <CategorySelect
                value={flow.category}
                onChange={handleSelectChange}
              />
            </Form.Group>

            <Form.Group as={Col} controlId="bankAccount">
              <Form.Label>Bank Account</Form.Label>
              <BankAccountSelect
                value={flow.bankAccount}
                onChange={handleSelectChange}
              />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId='date'>
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={flow.date}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group as={Col} controlId='cost'>
              <Form.Label>Amount</Form.Label>
              <InputGroup>
                <Form.Control
                  type="number"
                  placeholder={amountPlaceholder}
                  step="0.01"
                  value={flow.cost === undefined ? "" : flow.cost}
                  onChange={handleChange}
                  aria-describedby="expense-input-amount"
                  required
                />
                <InputGroup.Text id="expense-input-amount">{accountCurrency}</InputGroup.Text>
              </InputGroup>
            </Form.Group>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" type="submit">
            {submitLabel}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}