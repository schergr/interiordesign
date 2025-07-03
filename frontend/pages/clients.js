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

export default function Clients() {
  const emptyClient = {
    name: '',
    first_name: '',
    last_name: '',
    primary_phone: '',
    primary_email: '',
    secondary_phone: '',
    secondary_email: '',
    referral_type: '',
    employee_id: '',
    contact_info: '',
  };

  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyClient);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const fetchClients = async () => {
    const res = await fetch(`${API}/clients`);
    const data = await res.json();
    setClients(data);
  };

  const handleRowClick = async (params) => {
    const res = await fetch(`${API}/clients/${params.row.id}`);
    const data = await res.json();
    setForm(data);
    setOpen(true);
  };

  const handleDeleteClick = (id) => async () => {
    if (!window.confirm('Delete this client?')) return;
    await deleteData(`${API}/clients/${id}`);
    fetchClients();
  };

  const fetchEmployees = async () => {
    const res = await fetch(`${API}/employees`);
    const data = await res.json();
    setEmployees(data);
  };

  useEffect(() => { fetchClients(); fetchEmployees(); }, []);

  const closeDialog = () => { setOpen(false); };

  const saveDialog = async () => {
    if (form.id === undefined) {
      await fetch(`${API}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else {
      await putData(`${API}/clients/${form.id}`, form);
    }
    setOpen(false);
    fetchClients();
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'primary_phone', headerName: 'Primary Phone', flex: 1 },
    { field: 'primary_email', headerName: 'Primary Email', flex: 1 },
    { field: 'referral_type', headerName: 'Referral Type', flex: 1 },
    { field: 'employee', headerName: 'Referred By', flex: 1 },
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
      <h1>Clients</h1>
      {message && <p className="message">{message}</p>}
      <button onClick={() => { setForm(emptyClient); setOpen(true); }}>New Client</button>
      <div style={{ width: '100%' }}>
        <DataGrid
          autoHeight
          rows={clients}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={handleRowClick}
          disableRowSelectionOnClick
        />
      </div>

      {open && (
        <Dialog open={open} onClose={closeDialog} fullWidth>
          <DialogTitle>Edit Client</DialogTitle>
          <DialogContent style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            <input value={form.first_name || ''} onChange={e => setForm({...form, first_name: e.target.value})} placeholder="First Name" />
            <input value={form.last_name || ''} onChange={e => setForm({...form, last_name: e.target.value})} placeholder="Last Name" />
            <input value={form.primary_phone || ''} onChange={e => setForm({...form, primary_phone: e.target.value})} placeholder="Primary Phone" />
            <input value={form.primary_email || ''} onChange={e => setForm({...form, primary_email: e.target.value})} placeholder="Primary Email" />
            <input value={form.secondary_phone || ''} onChange={e => setForm({...form, secondary_phone: e.target.value})} placeholder="Secondary Phone" />
            <input value={form.secondary_email || ''} onChange={e => setForm({...form, secondary_email: e.target.value})} placeholder="Secondary Email" />
            <input value={form.referral_type || ''} onChange={e => setForm({...form, referral_type: e.target.value})} placeholder="Referral Type" />
            <select value={form.employee_id || ''} onChange={e => setForm({...form, employee_id: e.target.value})}>
              <option value="">Referred By</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
            <input value={form.contact_info || ''} onChange={e => setForm({...form, contact_info: e.target.value})} placeholder="Other Contact Info" />
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
