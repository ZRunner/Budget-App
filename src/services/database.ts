import { Balance, BankAccount, Category, EarningPerAccount, Flow, FlowInput, Transfer, TransferInput } from "../types";
import { formatDate } from "./utils";

const Accept = 'application/json';

class ApiHandler {
    async getCategories(): Promise<Category[]> {
        const resp = await fetch('/api/categories',
            { headers: { Accept } }
        );
        return await resp.json();
    }
    async getBankAccounts(): Promise<BankAccount[]> {
        const resp = await fetch("/api/bank_accounts", { headers: { Accept } });
        return await resp.json();
    }

    async getFlows(): Promise<Flow[]> {
        const resp = await fetch("/api/flows", { headers: { Accept } });
        return (await resp.json()).map((f: Flow) => {
            const d = new Date(f.date);
            return { ...f, date: formatDate(d) }
        })
    }

    async addFlow(flow: FlowInput) {
        const resp = await fetch("/api/flows", {
            method: 'POST',
            headers: { Accept, 'content-type': 'application/json' },
            body: JSON.stringify(flow),
        });
        return resp.ok ? Number(await resp.text()) : null;
    }

    async deleteFlow(flow_id: number) {
        const resp = await fetch("/api/flows/" + flow_id, {
            method: 'DELETE',
            headers: { Accept },
        });
        return resp.ok;
    }

    async editFlow(flow_id: number, flow: FlowInput) {
        const resp = await fetch("/api/flows/" + flow_id, {
            method: 'PUT',
            headers: { Accept, 'content-type': 'application/json' },
            body: JSON.stringify(flow),
        });
        return resp.ok;
    }

    async getTransfers(): Promise<Transfer[]> {
        const resp = await fetch("/api/transfers", { headers: { Accept } });
        return (await resp.json()).map((f: Flow) => {
            const d = new Date(f.date);
            return { ...f, date: formatDate(d) }
        })
    }

    async addTransfer(transfer: TransferInput) {
        const resp = await fetch("/api/transfers", {
            method: 'POST',
            headers: { Accept, 'content-type': 'application/json' },
            body: JSON.stringify(transfer),
        });
        return resp.ok ? Number(await resp.text()) : null;
    }

    async deleteTransfer(transfer_id: number) {
        const resp = await fetch("/api/transfers/" + transfer_id, {
            method: 'DELETE',
            headers: { Accept },
        });
        return resp.ok;
    }

    async getCurrentBalances(): Promise<Balance[]> {
        const resp = await fetch("/api/current_balances", { headers: { Accept } })
        return await resp.json();
    }

    async getHistoricBalances(date: string): Promise<Balance[]> {
        const resp = await fetch("/api/historic_balances/" + date, { headers: { Accept } })
        return await resp.json();
    }

    async getEarningsPerAccount(date: string): Promise<EarningPerAccount[]> {
        const resp = await fetch("/api/earnings_per_account?date=" + date, { headers: { Accept } })
        return await resp.json();
    }
}

const apiHandler = new ApiHandler();
export default apiHandler;