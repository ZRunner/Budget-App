import { useState } from "react";

import ExpenseForm, { ExpenseFormInputType } from "./ExpenseForm";

interface AddExpenseFormProps {
  visible: boolean;
  onHide: () => void;
}

export default function AddExpenseForm({ visible, onHide }: AddExpenseFormProps) {
  const [inputs, setInputs] = useState<ExpenseFormInputType>({
    id: undefined,
    name: "",
    cost: undefined,
    category: 10,
    bankAccount: 3,
    date: new Date().toISOString().split("T")[0],
  });

  return (
    <ExpenseForm
      visible={visible}
      onHide={onHide}
      expense={inputs}
      setExpense={setInputs}
    />
  );
}