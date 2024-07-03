import { useState } from "react";
import Button from "react-bootstrap/Button";

import ExpenseList from "../components/ExpensesPage/ExpenseList";
import AddExpenseForm from "../components/ExpensesPage/forms/AddExpenseForm";
import AddTransferForm from "../components/ExpensesPage/forms/AddTransferForm";

export default function ExpensesPage() {
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);

  const showExpenseModal = () => {
    setExpenseModalVisible(true);
  };

  const showTransferModal = () => {
    setTransferModalVisible(true);
  };

  return (
    <>
      <AddExpenseForm
        visible={expenseModalVisible}
        onHide={() => setExpenseModalVisible(false)}
      />
      <AddTransferForm
        visible={transferModalVisible}
        onHide={() => setTransferModalVisible(false)}
      />

      <div>
        <span>
          <Button variant="primary" onClick={showExpenseModal}>Add an expense</Button>
        </span>
        <span className="mx-1">
          <Button variant="primary" onClick={showTransferModal} >Add a transfer</Button>
        </span>
      </div>

      <h3 className="mt-3">Expenses</h3>
      <div className="row mt-3">
        <div className="col-sm">
          <ExpenseList />
        </div>
      </div>
    </>
  );
}
