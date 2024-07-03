import { Balance, BankAccount, Category, CurrencyRate, EarningPerAccount, Flow, FlowInput, Transfer, TransferInput } from "../types";
import { DbBalance, DbBankAccount, DbFlow, DbTransfer } from "./databaseTypes";
import { formatDate } from "./utils";

const Accept = "application/json";

function transformBankAccount<T extends DbBankAccount>(account: T): Omit<T, "creation_date" | "initial_balance"> & { creationDate: string, initialBalance: number } {
  const { creation_date: creationDate, initial_balance: initialBalance, ...data } = account;
  return {
    ...data,
    creationDate: creationDate,
    initialBalance: initialBalance,
  };
}

class ApiHandler {
  async getCategories(): Promise<Category[]> {
    const resp = await fetch("/api/categories",
      { headers: { Accept } }
    );
    return await resp.json();
  }

  async getBankAccounts(): Promise<BankAccount[]> {
    const resp = await fetch("/api/bank_accounts", { headers: { Accept } });
    const data = await resp.json() as DbBankAccount[];
    return data.map(transformBankAccount);
  }

  async getFlows(): Promise<Flow[]> {
    const resp = await fetch("/api/flows", { headers: { Accept } });
    return (await resp.json()).map((f: DbFlow) => {
      const d = new Date(f.date);
      const { bank_account: bankAccount, ...data } = f;
      return { ...data, date: formatDate(d), bankAccount: bankAccount } as Flow;
    });
  }

  async addFlow(flow: FlowInput) {
    const resp = await fetch("/api/flows", {
      method: "POST",
      headers: { Accept, "content-type": "application/json" },
      body: JSON.stringify(flow),
    });
    return resp.ok ? Number(await resp.text()) : null;
  }

  async deleteFlow(flowId: number) {
    const resp = await fetch("/api/flows/" + flowId, {
      method: "DELETE",
      headers: { Accept },
    });
    return resp.ok;
  }

  async editFlow(flowId: number, flow: FlowInput) {
    const resp = await fetch("/api/flows/" + flowId, {
      method: "PUT",
      headers: { Accept, "content-type": "application/json" },
      body: JSON.stringify(flow),
    });
    return resp.ok;
  }

  async getTransfers(): Promise<Transfer[]> {
    const resp = await fetch("/api/transfers", { headers: { Accept } });
    return (await resp.json()).map((f: DbTransfer) => {
      const d = new Date(f.date);
      const { from_account: fromAccount, to_account: toAccount, ...data } = f;
      return { ...data, date: formatDate(d), fromAccount, toAccount } as Transfer;
    });
  }

  async addTransfer(transfer: TransferInput) {
    const resp = await fetch("/api/transfers", {
      method: "POST",
      headers: { Accept, "content-type": "application/json" },
      body: JSON.stringify(transfer),
    });
    return resp.ok ? Number(await resp.text()) : null;
  }

  async deleteTransfer(transferId: number) {
    const resp = await fetch("/api/transfers/" + transferId, {
      method: "DELETE",
      headers: { Accept },
    });
    return resp.ok;
  }

  async getCurrentBalances(): Promise<Balance[]> {
    const resp = await fetch("/api/current_balances", { headers: { Accept } });
    const data = await resp.json() as DbBalance[];
    return data.map(transformBankAccount);
  }

  async getHistoricBalances(date: string): Promise<Balance[]> {
    const resp = await fetch("/api/historic_balances/" + date, { headers: { Accept } });
    const data = await resp.json() as DbBalance[];
    return data.map(transformBankAccount);
  }

  async getEarningsPerAccount(date: string): Promise<EarningPerAccount[]> {
    const resp = await fetch("/api/earnings_per_account?date=" + date, { headers: { Accept } });
    return await resp.json();
  }

  async getCurrencyRates(): Promise<CurrencyRate> {
    // source:
    // https://github.com/theDavidBarton/european-central-bank-currency-rates-to-json/blob/master/src/transformRatesToJSON.js
    // (MIT license)
    const resp = await fetch("/api/currency_rates");
    const txt = await resp.text();
    const parsedData = new DOMParser().parseFromString(txt, "application/xml");
    const cubes = Object.values(parsedData.getElementsByTagName("Cube"));

    const data = cubes.map(el => {
      const currency = el.attributes.getNamedItem("currency");
      const rate = el.attributes.getNamedItem("rate");
      if (currency !== null && rate !== null) {
        return {
          [currency.value]: parseFloat(rate.value),
        };
      }
      return undefined;
    }).filter(el => el !== undefined) as { [x: string]: number; }[];

    return Object.assign({ EUR: 1.0 }, ...data);
  }
}

const apiHandler = new ApiHandler();
export default apiHandler;