import { useState } from "react";
import Button from "react-bootstrap/Button";

import FlowList from "../components/FlowsPage/FlowList";
import AddFlow from "../components/FlowsPage/forms/AddFlow";
import AddTransferForm from "../components/FlowsPage/forms/AddTransferForm";

export default function FlowsPage() {
  const [expenseModalVisible, setFlowModalVisible] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);

  const showFlowModal = () => {
    setFlowModalVisible(true);
  };

  const showTransferModal = () => {
    setTransferModalVisible(true);
  };

  return (
    <>
      <AddFlow
        visible={expenseModalVisible}
        onHide={() => setFlowModalVisible(false)}
      />
      <AddTransferForm
        visible={transferModalVisible}
        onHide={() => setTransferModalVisible(false)}
      />

      <div>
        <span>
          <Button variant="primary" onClick={showFlowModal}>Add an expense</Button>
        </span>
        <span className="mx-1">
          <Button variant="primary" onClick={showTransferModal} >Add a transfer</Button>
        </span>
      </div>

      <h3 className="mt-3">Expenses</h3>
      <div className="row mt-3">
        <div className="col-sm">
          <FlowList />
        </div>
      </div>
    </>
  );
}
