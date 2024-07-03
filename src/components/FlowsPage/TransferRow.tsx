import "../../css/FlowItem.scss";

import { useMemo } from "react";
import { BsPencilFill } from "react-icons/bs";
import { TiDelete } from "react-icons/ti";

import { useTransferCommands } from "../../services/hooks";
import { getBankAccount } from "../../services/redux/moneySlice";
import { useAppSelector } from "../../services/redux/store";
import { Transfer } from "../../types";


interface TransferRowProps {
    transfer: Transfer;
}

export default function TransferRow({ transfer }: TransferRowProps) {
  const { deleteTransferCommand } = useTransferCommands();
  const fromAccount = useAppSelector(state => getBankAccount(state, transfer.fromAccount));
  const toAccount = useAppSelector(state => getBankAccount(state, transfer.toAccount));
  const format = (value: number, currency: string) => new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);

  const formatedDate = useMemo(() =>
    new Date(transfer.date).toLocaleDateString(undefined, { timeZone: "UTC" }),
  [transfer.date]
  );

  const formatedAmount1 = useMemo(() =>
    format(transfer.amount, fromAccount?.currency ?? "EUR"),
  [transfer.amount, fromAccount?.currency]
  );
  const formatedAmount2 = useMemo(() =>
    (fromAccount?.currency === toAccount?.currency
      ? undefined
      : format(transfer.amount * transfer.rate, toAccount?.currency ?? "EUR")),
  [transfer.amount, transfer.rate, fromAccount?.currency, toAccount?.currency]
  );

  const handleDeleteTransfer = () => {
    deleteTransferCommand(transfer.id);
  };

  return (
    <li className="expense-item list-group-item d-flex justify-content-between align-items-center">
      <div>
        <small className="fw-lighter text-secondary me-2">
          {formatedDate}
        </small>
        <span>{transfer.name}</span>
        <span className="badge bg-secondary rounded-pill ms-2">
          {fromAccount?.name ?? "?"} → {toAccount?.name ?? "?"}
        </span>
      </div>
      <div>
        <span className="badge bg-secondary rounded-pill me-3">
          {formatedAmount2 ? `${formatedAmount1} → ${formatedAmount2}` : formatedAmount1}
        </span>
        <BsPencilFill className="edit-btn mx-1" size="1.3em" />
        <TiDelete className="delete-btn" size="1.5em" onClick={handleDeleteTransfer} />
      </div>
    </li>
  );
}