import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import SummaryBox from './components/SummaryBox';
import 'bootstrap/dist/css/bootstrap.min.css';
import apiHandler from './services/database';
import { useAppDispatch } from './services/redux/store';
import { setBankAccounts, setCategories, setCurrencyRates, setFlows, setTransfers } from './services/redux/moneySlice';
import ExpensesPage from './pages/ExpensesPage';
import { StatsPage } from './pages/StatsPage';
import HistoryPage from './pages/HistoryPage';

function App() {
  const [page, setPage] = useState("1");
  const dispatch = useAppDispatch();

  const handlePageChange = (e: unknown, value: string) => {
    setPage(value);
  }

  useEffect(() => {
    // load data from database
    console.log("Loading data from database...")
    apiHandler.getFlows()
      .then(json => {
        dispatch(setFlows(json));
      })
    apiHandler.getTransfers()
      .then(json => {
        dispatch(setTransfers(json));
      })
    apiHandler.getBankAccounts()
      .then(json => {
        dispatch(setBankAccounts(json));
      })
    apiHandler.getCategories()
      .then(json => {
        dispatch(setCategories(json));
      })

    // load currencies values
    apiHandler.get_currency_rates()
      .then(rates => {
        dispatch(setCurrencyRates(rates));
      })
  }, [dispatch])

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
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handlePageChange}>
            <Tab label="Expenses" value="1" />
            <Tab label="Accounts history" value="2" />
            <Tab label="Statistics" value="3" />
            <Tab label="Settings" value="4" disabled />
          </TabList>
        </Box>
        <TabPanel value="1">
          <ExpensesPage />
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
