import { useState } from "react";

import { useFlowCommands } from "../../../services/hooks";
import FlowForm, { FlowFormInputType } from "./FlowForm";

interface AddFlowProps {
  visible: boolean;
  onHide: () => void;
}

export default function AddFlow({ visible, onHide }: AddFlowProps) {
  const { addFlowCommand } = useFlowCommands();

  const initialValue = {
    id: undefined,
    name: "",
    cost: undefined,
    category: 10,
    bankAccount: 3,
    date: new Date().toISOString().split("T")[0],
  };

  const onSubmit = (flow: FlowFormInputType) => {
    addFlowCommand(flow);
    onHide();
  };

  return (
    <FlowForm
      visible={visible}
      onHide={onHide}
      initialValue={initialValue}
      onSubmit={onSubmit}
    />
  );
}