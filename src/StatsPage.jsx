import React,  { Component } from 'react';

import FlowDiffGraph from './Components/FlowsDiffGraph';

class StatsPage extends Component {

    render() {
        return (
            <FlowDiffGraph startDate="2021-09-01" />
        )
    }
}

export default StatsPage;