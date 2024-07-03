import "../../css/FlowItem.scss";

import chroma from "chroma-js";
import { Fragment, memo, useMemo, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { BsPencilFill } from "react-icons/bs";
import { TiDelete } from "react-icons/ti";

import { useFlowCommands } from "../../services/hooks";
import { getBankAccount, getCategory, getCurrencyRates } from "../../services/redux/moneySlice";
import { useAppSelector } from "../../services/redux/store";
import { Flow } from "../../types";
import EditFlow from "./forms/EditFlow";


interface FlowRowProps {
  flow: Flow;
}

export default function FlowRow({ flow }: FlowRowProps) {
  const { deleteFlowCommand } = useFlowCommands();
  const bankAccount = useAppSelector(state => getBankAccount(state, flow.bankAccount));
  const category = useAppSelector(state => getCategory(state, flow.category));

  const formatedDate = useMemo(() =>
    new Date(flow.date).toLocaleDateString(undefined, { timeZone: "UTC" }),
  [flow.date]
  );

  const handleDeleteFlow = () => {
    deleteFlowCommand(flow.id);
  };

  const categoryColor = category && chroma(category?.color).alpha(0.6).css();

  return (
    <li className="expense-item list-group-item d-flex justify-content-between align-items-center">
      <div>
        <small className="fw-lighter text-secondary me-2">
          {formatedDate}
        </small>
        <span>{flow.name}</span>
        <span className="badge bg-secondary rounded-pill ms-2">
          {bankAccount?.name ?? "?"}
        </span>
      </div>
      <div>
        <small className="text-white me-2 badge rounded-pill" style={{ backgroundColor: categoryColor, fontWeight: "initial" }}>
          {category?.name ?? "?"}
        </small>
        <AmountPill amount={flow.cost} currency={flow.currency} />
        <EditButton flow={flow} />
        <TiDelete className="delete-btn" size="1.5em" onClick={handleDeleteFlow} />
      </div>
    </li>
  );
}

const AmountPill = memo(
  function AmountPill({ amount, currency }: { amount: number, currency: string }) {
    const currencyRates = useAppSelector(getCurrencyRates);

    const format = (value: number, valueCurrency: string) => new Intl.NumberFormat(undefined, { style: "currency", currency: valueCurrency }).format(value);

    const formatedAmount = format(amount, currency);

    const tooltip = (
      <Tooltip>
        {format(amount / currencyRates[currency], "EUR")}
      </Tooltip>
    );

    const pillColor = amount > 0 ? "success" : "danger";

    const pill = (
      <span className={`badge bg-${pillColor} rounded-pill me-3`}>
        {formatedAmount}
      </span>
    );

    if (currency === "EUR") {
      return pill;
    }

    return (
      <OverlayTrigger
        placement="top"
        overlay={tooltip}
      >
        {pill}
      </OverlayTrigger>
    );
  }
);

function EditButton({ flow }: {flow: Flow}) {
  const [editModalVisible, setEditModalVisible] = useState(false);

  return (
    <Fragment>
      <BsPencilFill className="edit-btn mx-1" size="1.3em" onClick={() => setEditModalVisible(true)} />
      {editModalVisible && <EditFlow flow={flow} visible={editModalVisible} onHide={() => setEditModalVisible(false)} />}
    </Fragment>
  );
}