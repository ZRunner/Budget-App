import React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import 'bootstrap/dist/css/bootstrap.min.css';

import SummaryBox from './Components/SummaryBox';
import { AppProvider } from './AppContext';
import ExpensesPage from './ExpensesPage';
import HistoryPage from './HistoryPage';
import StatsPage from './StatsPage';

const App = () => {

  const [value, setValue] = React.useState('1');


  return (
    <AppProvider>
    <div className="container">
      <h1 className="mt-3">My Wallet Manager</h1>
      <div className="row mt-3">
        <div className="col-sm">
          <SummaryBox id="budget" name="Budget" />
        </div>
        <div className="col-sm">
          <SummaryBox id="remaining" name="Remaining" />
        </div>
        <div className="col-sm">
          <SummaryBox id="spent" name="Spent so far" />
        </div>
      </div>

      <TabContext value={value}>
        <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
          <TabList onChange={(e, value) => setValue(value)}>
            <Tab label="Expenses" value="1" />
            <Tab label="Accounts history" value="2" />
            <Tab label="Statistics" value="3" />
            <Tab label="Settings" value="4" disabled />
          </TabList>
        </Box>
        <TabPanel value="1"><ExpensesPage/></TabPanel>
        <TabPanel value="2"><HistoryPage/></TabPanel>
        <TabPanel value="3"><StatsPage/></TabPanel>
      </TabContext>
      
    </div>
    </AppProvider>
  )
}

export default App;
