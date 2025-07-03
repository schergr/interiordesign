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

export default function Leads() {
  const emptyLead = { name: '', contact_info: '', stage_id: '' };

  const [leads, setLeads] = useState([]);
  const [stages, setStages] = useState([]);
  const [form, setForm] = useState(emptyLead);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const fetchLeads = async () => {
    const res = await fetch(`${API}/leads`);
    const data = await res.json();
    setLeads(data);
  };

  const handleRowClick = async (params) => {
    const res = await fetch(`${API}/leads/${params.row.id}`);
    const data = await res.json();
    setForm(data);
    setOpen(true);
  };

  const handleDeleteClick = (id) => async () => {
    if (!window.confirm('Delete this lead?')) return;
    await deleteData(`${API}/leads/${id}`);
    fetchLeads();
  };

  const fetchStages = async () => {
    const res = await fetch(`${API}/leadstages`);
    const data = await res.json();
    setStages(data);
  };


  useEffect(() => { fetchLeads(); fetchStages(); }, []);

  const closeDialog = () => { setOpen(false); };

  const saveDialog = async () => {
    if (form.id === undefined) {
      await fetch(`${API}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else {
      await putData(`${API}/leads/${form.id}`, form);
    }
    setOpen(false);
    fetchLeads();
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'stage', headerName: 'Stage', flex: 1 },
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
      <h1>Leads</h1>
      {message && <p className="message">{message}</p>}
      <button onClick={() => { setForm(emptyLead); setOpen(true); }}>New Lead</button>
      <div style={{ width: '100%' }}>
        <DataGrid
          autoHeight
          rows={leads}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={handleRowClick}
          disableRowSelectionOnClick
        />
      </div>

      {open && (
        <Dialog open={open} onClose={closeDialog} fullWidth>
          <DialogTitle>Edit Lead</DialogTitle>
          <DialogContent style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            <input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="Lead Name" />
            <input value={form.contact_info || ''} onChange={e => setForm({...form, contact_info: e.target.value})} placeholder="Contact Info" />
            <select value={form.stage_id || ''} onChange={e => setForm({...form, stage_id: e.target.value})} required>
              <option value="">Stage</option>
              {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
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
