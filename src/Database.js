const Accept = 'application/json';

class ApiHandler {

    async getCategories() {
        const resp = await fetch("/api/categories", {headers: {Accept}});
        return await resp.json();
    }
    
    async getBankAccounts() {
        const resp = await fetch("/api/bank_accounts", {headers: {Accept}});
        return await resp.json();
    }
    
    async getFlows() {
        const resp = await fetch("/api/flows", {headers: {Accept}});
        return (await resp.json()).map(f => {
            let d = new Date(f.date);
            d = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            return {...f, date: d}
        })
    }
    
    async addFlow(flow) {
        const resp = await fetch("/api/flow", {
            method: 'POST',
            headers: {Accept, 'content-type': 'application/json'},
            body: JSON.stringify(flow),
        });
        return resp.ok ? await resp.text() : false;
    }
    
    async deleteFlow(flow_id) {
        const resp = await fetch("/api/flow/"+flow_id, {
            method: 'DELETE',
            headers: {Accept},
        });
        return resp.ok;
    }

    async editFlow(flow_id, flow) {
        const resp = await fetch("/api/flow/"+flow_id, {
            method: 'PUT',
            headers: {Accept},
            body: JSON.stringify(flow),
        });
        return resp.ok;
    }
}

const apiHandler = new ApiHandler();
export default apiHandler;