import "bootstrap/dist/css/bootstrap.min.css";

import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import { useEffect, useState } from "react";

import SummaryBox from "./components/SummaryBox";
import FlowsPage from "./pages/FlowsPage";
import HistoryPage from "./pages/HistoryPage";
import { StatsPage } from "./pages/StatsPage";
import apiHandler from "./services/database";
import { setBankAccounts, setCategories, setCurrencyRates, setFlows, setTransfers } from "./services/redux/moneySlice";
import { useAppDispatch } from "./services/redux/store";

function App() {
  const [page, setPage] = useState("1");
  const dispatch = useAppDispatch();

  const handlePageChange = (e: unknown, value: string) => {
    setPage(value);
  };

  useEffect(() => {
    // load data from database
    console.log("Loading data from database...");
    apiHandler.getFlows()
      .then(json => {
        dispatch(setFlows(json));
      });
    apiHandler.getTransfers()
      .then(json => {
        dispatch(setTransfers(json));
      });
    apiHandler.getBankAccounts()
      .then(json => {
        dispatch(setBankAccounts(json));
      });
    apiHandler.getCategories()
      .then(json => {
        dispatch(setCategories(json));
      });

    // load currencies values
    apiHandler.getCurrencyRates()
      .then(rates => {
        dispatch(setCurrencyRates(rates));
      });
  }, [dispatch]);

  return (
    <div className="container">
      <h1 className="mt-3">My Wallet Manager</h1>
      <div className="row mt-3">
        <div className="col-sm">
          <SummaryBox id="total" />
        </div>
        <div className="col-sm">
          <SummaryBox id="1month" />
        </div>
        <div className="col-sm">
          <SummaryBox id="6months" />
        </div>
      </div>

      <TabContext value={page}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handlePageChange}>
            <Tab label="Expenses" value="1" />
            <Tab label="Accounts history" value="2" />
            <Tab label="Statistics" value="3" />
            <Tab label="Settings" value="4" disabled />
          </TabList>
        </Box>
        <TabPanel value="1">
          <FlowsPage />
        </TabPanel>
        <TabPanel value="2">
          <HistoryPage />
        </TabPanel>
        <TabPanel value="3">
          <StatsPage />
        </TabPanel>
      </TabContext>
    </div>
  );
}

export default App;
