import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';

const API = 'http://localhost:5000';

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [clientId, setClientId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [statusId, setStatusId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const fetchContracts = async () => {
    const res = await fetch(`${API}/contracts`);
    setContracts(await res.json());
  };
  const fetchClients = async () => {
    const res = await fetch(`${API}/clients`);
    setClients(await res.json());
  };
  const fetchEmployees = async () => {
    const res = await fetch(`${API}/employees`);
    setEmployees(await res.json());
  };
  const fetchProjects = async () => {
    const res = await fetch(`${API}/projects`);
    setProjects(await res.json());
  };
  const fetchStatuses = async () => {
    const res = await fetch(`${API}/contractstatuses`);
    setStatuses(await res.json());
  };

  useEffect(() => { fetchContracts(); fetchClients(); fetchEmployees(); fetchProjects(); fetchStatuses(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId || null,
        employee_id: employeeId || null,
        project_id: projectId || null,
        status_id: statusId || null,
        amount
      })
    });
    if (res.ok) {
      setMessage('Added contract');
      fetchContracts();
    } else {
      setMessage('Error adding contract');
    }
    setClientId('');
    setEmployeeId('');
    setProjectId('');
    setStatusId('');
    setAmount('');
  };

  const columns = [
    { field: 'project', headerName: 'Project', flex: 1 },
    { field: 'client', headerName: 'Client', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    { field: 'amount', headerName: 'Amount', flex: 1 },
  ];

  return (
    <main>
      <h1>Contracts</h1>
      {message && <p className="message">{message}</p>}
      <form onSubmit={submit} className="form">
        <select value={clientId} onChange={e => setClientId(e.target.value)}>
          <option value="">Client</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={employeeId} onChange={e => setEmployeeId(e.target.value)}>
          <option value="">Employee</option>
          {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
        </select>
        <select value={projectId} onChange={e => setProjectId(e.target.value)}>
          <option value="">Project</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={statusId} onChange={e => setStatusId(e.target.value)}>
          <option value="">Status</option>
          {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" />
        <button type="submit">Add</button>
      </form>
      <div style={{ width: '100%' }}>
        <DataGrid
          autoHeight
          rows={contracts}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
        />
      </div>
    </main>
  );
}
