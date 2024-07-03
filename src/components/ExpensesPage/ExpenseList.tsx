import React, { useMemo, useState } from "react";

import { getBankAccounts, getCategories, getFlows, getTransfers } from "../../services/redux/moneySlice";
import { useAppSelector } from "../../services/redux/store";
import { isTransfer } from "../../services/utils";
import ListedFlow from "./ListedFlow";
import ListedTransfer from "./ListedTransfer";

const sortDates = (a: { date: string }, b: { date: string }) => new Date(b.date).getTime() - new Date(a.date).getTime();

export default function ExpenseList() {
  const flows = useAppSelector(getFlows);
  const transfers = useAppSelector(getTransfers);
  const bankAccounts = useAppSelector(getBankAccounts);
  const categories = useAppSelector(getCategories);
  const [searchTerms, setSearchTerms] = useState<string | null>(null);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length === 0) {
      setSearchTerms(null);
    } else {
      setSearchTerms(event.target.value.toLowerCase());
    }
  };

  const filteredItems = useMemo(() => {
    if (searchTerms === null) {
      return [...flows, ...transfers].sort(sortDates);
    }

    const getBankAccount = (accountId: number) => bankAccounts.find(acc => acc.id === accountId);

    const getCategory = (categoryId: number) => categories.find(cat => cat.id === categoryId);

    const searchResultExpenses = flows.filter(
      (flow) => flow.name.toLowerCase().includes(searchTerms)
                || getBankAccount(flow.bankAccount)?.name.toLowerCase().includes(searchTerms)
                || getCategory(flow.category)?.name.toLowerCase().includes(searchTerms)
    );
    const searchResultTransfers = transfers.filter(
      (transfer) => transfer.name.toLowerCase().includes(searchTerms)
                || getBankAccount(transfer.fromAccount)?.name.toLowerCase().includes(searchTerms)
                || getBankAccount(transfer.toAccount)?.name.toLowerCase().includes(searchTerms)
                || getCategory(transfer.category)?.name.toLowerCase().includes(searchTerms)
    );
    return [...searchResultExpenses, ...searchResultTransfers].sort(sortDates);
  }, [flows, transfers, bankAccounts, categories, searchTerms]);

  return (
    <>
      <input
        type="text"
        className="form-control mb-2 mr-sm-2"
        placeholder="Type to search..."
        onChange={handleFilterChange}
      />
      <ul className="list-group">
        {
          filteredItems.map((item) => {
            if (isTransfer(item)) { // it is a transfer
              return <ListedTransfer key={item.id + "t"} transfer={item} />;
            } else { // it is a normal expense
              return <ListedFlow key={item.id + "f"} flow={item} />;
            }
          })
        }
      </ul>
    </>
  );
}