import { useMemo } from "react";
import { TiDelete } from 'react-icons/ti';
import { BsPencilFill } from 'react-icons/bs';
import { useCurrencyFormat, useFlowCommands } from "../services/hooks";
import { Flow } from "../types";

import '../css/ExpenseItem.scss';
import { useAppSelector } from "../services/redux/store";
import { getBankAccount, getCategory } from "../services/redux/moneySlice";


interface ListedFlowProps {
    flow: Flow;
}

export default function ListedFlow({ flow }: ListedFlowProps) {
    const { deleteFlowCommand } = useFlowCommands();
    const bankAccount = useAppSelector(state => getBankAccount(state, flow.bank_account))
    const category = useAppSelector(state => getCategory(state, flow.category))
    const format = useCurrencyFormat();

    const formatedDate = useMemo(() =>
        new Date(flow.date).toLocaleDateString(undefined, { timeZone: "UTC" }),
        [flow.date]
    )

    const formatedAmount = useMemo(() =>
        format.format(flow.cost),
        [format, flow.cost]
    )

    const handleDeleteExpense = () => {
        deleteFlowCommand(flow.id)
    }

    const pillColor = flow.cost > 0 ? 'success' : 'danger';

    return (
        <li className="expense-item list-group-item d-flex justify-content-between align-items-center">
            <div>
                <small className="fw-lighter text-secondary me-2">
                    {formatedDate}
                </small>
                <span>{flow.name}</span>
                <span className="badge bg-secondary rounded-pill ms-2">
                    {bankAccount?.name ?? '?'}
                </span>
            </div>
            <div>
                <small className="text-secondary me-2">
                    {category?.name ?? '?'}
                </small>
                <span className={`badge bg-${pillColor} rounded-pill me-3`}>
                    {formatedAmount}
                </span>
                <BsPencilFill className="edit-btn mx-1" size="1.3em" />
                <TiDelete className="delete-btn" size="1.5em" onClick={handleDeleteExpense} />
            </div>
        </li>
    )
}