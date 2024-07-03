import { useState } from "react";

import FlowForm, { FlowFormInputType } from "./FlowForm";

interface AddFlowProps {
  visible: boolean;
  onHide: () => void;
}

export default function AddFlow({ visible, onHide }: AddFlowProps) {
  const [inputs, setInputs] = useState<FlowFormInputType>({
    id: undefined,
    name: "",
    cost: undefined,
    category: 10,
    bankAccount: 3,
    date: new Date().toISOString().split("T")[0],
  });

  return (
    <FlowForm
      visible={visible}
      onHide={onHide}
      expense={inputs}
      setFlow={setInputs}
    />
  );
}