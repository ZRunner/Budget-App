export interface Category {
  id: number;
  name: string;
  color: string;
}

export interface BankAccount {
  id: number;
  name: string;
  creationDate: string;
  initialBalance: number;
  color: string;
  currency: string;
}


export interface Flow {
  id: number;
  name: string;
  cost: number;
  category: number;
  bankAccount: number;
  currency: string;
  date: string;
}

export interface FlowInput {
  name: string;
  cost: number;
  category: number;
  bankAccount: number;
  date: string;
}


export interface Transfer {
  id: number;
  name: string;
  amount: number;
  rate: number;
  category: number;
  fromAccount: number;
  toAccount: number;
  date: string;
}

export interface TransferInput {
  name: string;
  amount: number;
  rate: number;
  category: number;
  fromAccount: number;
  toAccount: number;
  date: string;
}

export interface Balance extends BankAccount {
  balance: number;
}

export interface EarningPerAccount {
  id: number;
  name: string;
  color: string;
  currency: string;
  expenses: number | null;
  incomes: number | null;
}

export type CurrencyRate = { [x: string]: number }