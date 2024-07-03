export interface DbFlow {
  id: number;
  name: string;
  cost: number;
  category: number;
  bank_account: number;
  currency: string;
  date: string;
}

export interface DbTransfer {
  id: number;
  name: string;
  amount: number;
  rate: number;
  category: number;
  from_account: number;
  to_account: number;
  date: string;
}

export interface DbBankAccount {
  id: number;
  name: string;
  creation_date: string;
  initial_balance: number;
  color: string;
  currency: string;
}

export interface DbBalance extends DbBankAccount {
  balance: number;
}