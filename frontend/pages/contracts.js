import { useState, useEffect } from 'react';
import {
  DataGrid,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { putData, deleteData } from '../lib/api.js';

const API = 'http://localhost:5000';

export default function Contracts() {
  const emptyContract = {
    client_id: '',
    employee_id: '',
    project_id: '',
    status_id: '',
    amount: '',
  };

  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [form, setForm] = useState(emptyContract);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const fetchContracts = async () => {
    const res = await fetch(`${API}/contracts`);
    setContracts(await res.json());
  };

  const handleRowClick = async (params) => {
    const res = await fetch(`${API}/contracts/${params.row.id}`);
    const data = await res.json();
    setForm(data);
    setOpen(true);
  };

  const handleDeleteClick = (id) => async () => {
    if (!window.confirm('Delete this contract?')) return;
    await deleteData(`${API}/contracts/${id}`);
    fetchContracts();
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

  const closeDialog = () => { setOpen(false); };

  const saveDialog = async () => {
    if (form.id === undefined) {
      await fetch(`${API}/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else {
      await putData(`${API}/contracts/${form.id}`, form);
    }
    setOpen(false);
    fetchContracts();
  };

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  const columns = [
    { field: 'project', headerName: 'Project', flex: 1 },
    { field: 'client', headerName: 'Client', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      valueFormatter: ({ value }) =>
        value === undefined || value === null || value === '' ||
        !Number.isFinite(Number(value))
          ? ''
          : currencyFormatter.format(Number(value))
    },
    {
      field: 'actions',
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={handleDeleteClick(params.id)}
        />,
      ],
    },
  ];

  return (
    <main>
      <h1>Contracts</h1>
      {message && <p className="message">{message}</p>}
      <button onClick={() => { setForm(emptyContract); setOpen(true); }}>New Contract</button>
      <div style={{ width: '100%' }}>
        <DataGrid
          autoHeight
          rows={contracts}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={handleRowClick}
          disableRowSelectionOnClick
        />
      </div>

      {open && (
        <Dialog open={open} onClose={closeDialog} fullWidth>
          <DialogTitle>Edit Contract</DialogTitle>
          <DialogContent style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            <select value={form.client_id || ''} onChange={e => setForm({...form, client_id: e.target.value})}>
              <option value="">Client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={form.employee_id || ''} onChange={e => setForm({...form, employee_id: e.target.value})}>
              <option value="">Employee</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
            <select value={form.project_id || ''} onChange={e => setForm({...form, project_id: e.target.value})}>
              <option value="">Project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={form.status_id || ''} onChange={e => setForm({...form, status_id: e.target.value})}>
              <option value="">Status</option>
              {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input value={form.amount || ''} onChange={e => setForm({...form, amount: e.target.value})} placeholder="Amount" />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button onClick={saveDialog}>Save</Button>
          </DialogActions>
        </Dialog>
      )}
    </main>
  );
}
