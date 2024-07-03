import { useFlowCommands } from "../../../services/hooks";
import { Flow, FlowInput } from "../../../types";
import FlowForm, { FlowFormInputType } from "./FlowForm";

interface EditFlowProps {
  flow: Flow;
  visible: boolean;
  onHide: () => void;
}

export default function EditFlow({ flow, visible, onHide }: EditFlowProps) {
  const { editFlowCommand } = useFlowCommands();

  function handleSubmit(editedFlow: FlowFormInputType) {
    if (!flowsAreEquals(flow, editedFlow)) {
      editFlowCommand({
        ...editedFlow,
        id: flow.id,
        currency: flow.currency,
      });
    }
    onHide();
  }

  return (
    <FlowForm
      visible={visible}
      onHide={onHide}
      initialValue={flow}
      onSubmit={handleSubmit}
    />
  );
}

function flowsAreEquals(a: FlowInput, b: FlowInput) {
  return (
    a.name === b.name &&
    a.cost === b.cost &&
    a.category === b.category &&
    a.bankAccount === b.bankAccount &&
    a.date === b.date
  );
}