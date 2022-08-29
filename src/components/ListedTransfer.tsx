import { useMemo } from "react";
import { TiDelete } from 'react-icons/ti';
import { BsPencilFill } from 'react-icons/bs';
import { useCurrencyFormat, useTransferCommands } from "../services/hooks";
import { Transfer } from "../types";

import '../css/ExpenseItem.scss';
import { useAppSelector } from "../services/redux/store";
import { getBankAccount } from "../services/redux/moneySlice";


interface ListedTransferProps {
    transfer: Transfer;
}

export default function ListedTransfer({ transfer }: ListedTransferProps) {
    const { deleteTransferCommand } = useTransferCommands();
    const fromAccount = useAppSelector(state => getBankAccount(state, transfer.from_account))
    const toAccount = useAppSelector(state => getBankAccount(state, transfer.to_account))
    const format = useCurrencyFormat();

    const formatedDate = useMemo(() =>
        new Date(transfer.date).toLocaleDateString(undefined, { timeZone: "UTC" }),
        [transfer.date]
    )

    const formatedAmount = useMemo(() =>
        format.format(transfer.amount),
        [format, transfer.amount]
    )

    const handleDeleteTransfer = () => {
        deleteTransferCommand(transfer.id);
    }

    return (
        <li className="expense-item list-group-item d-flex justify-content-between align-items-center">
            <div>
                <small className="fw-lighter text-secondary me-2">
                    {formatedDate}
                </small>
                <span>{transfer.name}</span>
                <span className="badge bg-secondary rounded-pill ms-2">
                    {fromAccount?.name ?? '?'} 🠖 {toAccount?.name ?? '?'}
                </span>
            </div>
            <div>
                {/* <small className="text-secondary me-2">
                    {category?.name ?? '?'}
                </small> */}
                <span className="badge bg-secondary rounded-pill me-3">
                    {formatedAmount}
                </span>
                <BsPencilFill className="edit-btn mx-1" size="1.3em" />
                <TiDelete className="delete-btn" size="1.5em" onClick={handleDeleteTransfer} />
            </div>
        </li>
    )
}