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

export type ExpenseFormInputType = Omit<Flow, "id" | "cost" | "currency"> & { id: number | undefined, cost: number | undefined };

interface ExpenseFormProps {
  visible: boolean;
  onHide: () => void;
  expense: ExpenseFormInputType;
  setExpense: (expense: ExpenseFormInputType) => void;
}

const amountPlaceholder = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2 }).format(0.0);

export default function ExpenseForm({ visible, onHide, expense, setExpense }: ExpenseFormProps) {
  const { addFlowCommand } = useFlowCommands();
  const accounts = useAppSelector(getBankAccounts);

  const accountCurrency = accounts.find(acc => acc.id === expense.bankAccount)?.currency ?? "EUR";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const id = event.target.id;
    const value = event.target.value;
    setExpense({ ...expense, [id]: value });
  };
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const id = event.target.id;
    const value = event.target.value;
    setExpense({ ...expense, [id]: Number(value) });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addFlowCommand({
      ...expense,
      cost: Number(expense.cost),
    });
    onHide();
  };

  const isNewExpense = expense.id === undefined;
  const modalTitle = isNewExpense ? "New expense" : `Edit expense #${expense.id}`;
  const submitLable = isNewExpense ? "Add expense" : "Save changes";

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
              value={expense.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="category">
              <Form.Label>Category</Form.Label>
              <CategorySelect
                value={expense.category}
                onChange={handleSelectChange}
              />
            </Form.Group>

            <Form.Group as={Col} controlId="bankAccount">
              <Form.Label>Bank Account</Form.Label>
              <BankAccountSelect
                value={expense.bankAccount}
                onChange={handleSelectChange}
              />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId='date'>
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={expense.date}
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
                  value={expense.cost === undefined ? "" : expense.cost}
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
            {submitLable}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}