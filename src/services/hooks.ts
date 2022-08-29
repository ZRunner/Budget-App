import { useMemo } from "react";
import { Flow, FlowInput, TransferInput } from "../types";
import apiHandler from "./database";
import { addFlow, addTransfer, deleteFlow, deleteTransfer, editFlow } from "./redux/moneySlice";
import { useAppDispatch } from "./redux/store";

export function useCurrencyFormat() {
    return useMemo(() => {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' })
    }, [])
}

export function useFlowCommands() {
    const dispatch = useAppDispatch();

    function addFlowCommand(flow: FlowInput) {
        apiHandler.addFlow(flow).then(new_id => {
            if (new_id === null) return;
            dispatch(addFlow({
                ...flow,
                id: new_id,
            }))
        })
    };

    function deleteFlowCommand(flowId: number) {
        apiHandler.deleteFlow(flowId).then(isOk => {
            if (isOk) {
                dispatch(deleteFlow(flowId))
            }
        })
    }

    function editFlowCommand(flow: Flow) {
        apiHandler.editFlow(flow.id, flow).then(isOk => {
            if (isOk) {
                dispatch(editFlow(flow));
            }
        })
    }

    return { addFlowCommand, deleteFlowCommand, editFlowCommand };
}

export function useTransferCommands() {
    const dispatch = useAppDispatch();

    function addTransferCommand(transfer: TransferInput) {
        apiHandler.addTransfer(transfer).then(new_id => {
            if (new_id === null) return;
            dispatch(addTransfer({
                ...transfer,
                id: new_id,
            }))
        })
    };

    function deleteTransferCommand(transferId: number) {
        apiHandler.deleteTransfer(transferId).then(isOk => {
            if (isOk) {
                dispatch(deleteTransfer(transferId))
            }
        })
    }


    return { addTransferCommand, deleteTransferCommand };
}