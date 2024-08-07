import "../css/StatsPage.scss";

import { lazy, Suspense } from "react";
import { useSelector } from "react-redux";

import BankAccountsSelect from "../components/shared/BankAccountsSelect";
import AccountsDoughnutGraph from "../components/StatsPage/AccountsDoughnutGraph";
import CategoriesDoughnutGraph from "../components/StatsPage/CategoriesDoughnutGraph";
import EarningsDoughnutGraph from "../components/StatsPage/EarningsDoughnutGraph";
import { getSelectedBankAccounts } from "../services/redux/contextSlice";

const FlowDiffGraph = lazy(() => import("../components/StatsPage/FlowDiffGraph"));
const AccountsHistoryGraph = lazy(() => import("../components/StatsPage/AccountsHistoryGraph"));


export function StatsPage() {
  const selectedAccounts = useSelector(getSelectedBankAccounts);

  return (
    <div id="statspage">
      <h3 className="mt-3">Statistics</h3>

      <div className="row mt-3 mb-2">
        <label className="col-form-label">Select accounts:</label>
        <BankAccountsSelect />
      </div>

      <h4>Expenses and Incomes history</h4>
      <Suspense>
        <FlowDiffGraph startDate="2021-09-01" bankAccounts={selectedAccounts} />
      </Suspense>

      <h4>Balances history</h4>
      <Suspense>
        <AccountsHistoryGraph startDate="2021-09-01" bankAccounts={selectedAccounts} />
      </Suspense>

      <h4>Current balance repartition</h4>
      <Suspense>
        <AccountsDoughnutGraph bankAccounts={selectedAccounts} />
      </Suspense>

      <h4>Expenses and Incomes repartition per bank account (2 months)</h4>
      <Suspense>
        <EarningsDoughnutGraph bankAccounts={selectedAccounts} monthsCount={2} />
      </Suspense>

      <h4>Expenses and Incomes repartition per category (2 months)</h4>
      <Suspense>
        <CategoriesDoughnutGraph bankAccounts={selectedAccounts} monthsCount={2} />
      </Suspense>
    </div>
  );
}