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

export default function Projects() {
  const emptyProject = {
    name: '',
    start_date: '',
    client_id: '',
    product_ids: [],
  };

  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProject);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const fetchProjects = async () => {
    const res = await fetch(`${API}/projects`);
    const data = await res.json();
    setProjects(data);
  };

  const handleRowClick = async (params) => {
    const res = await fetch(`${API}/projects/${params.row.id}`);
    const data = await res.json();
    setForm({ ...data, products: params.row.products });
    setOpen(true);
  };

  const handleDeleteClick = (id) => async () => {
    if (!window.confirm('Delete this project?')) return;
    await deleteData(`${API}/projects/${id}`);
    fetchProjects();
  };

  const fetchClients = async () => {
    const res = await fetch(`${API}/clients`);
    const data = await res.json();
    setClients(data);
  };

  const fetchProducts = async () => {
    const res = await fetch(`${API}/products`);
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => { fetchProjects(); fetchClients(); fetchProducts(); }, []);

  const toggleProduct = (id) => {
    setForm(prev => ({ ...prev, product_ids: prev.product_ids.includes(id) ? prev.product_ids.filter(p => p !== id) : [...prev.product_ids, id] }));
  };

  const closeDialog = () => { setOpen(false); };

  const saveDialog = async () => {
    if (form.id === undefined) {
      await fetch(`${API}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else {
      await putData(`${API}/projects/${form.id}`, form);
    }
    setOpen(false);
    fetchProjects();
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'start_date', headerName: 'Start Date', flex: 1 },
    { field: 'client', headerName: 'Client', flex: 1 },
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
      <h1>Projects</h1>
      {message && <p className="message">{message}</p>}
      <button onClick={() => { setForm(emptyProject); setOpen(true); }}>New Project</button>
      <div style={{ width: '100%' }}>
        <DataGrid
          autoHeight
          rows={projects}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={handleRowClick}
          disableRowSelectionOnClick
        />
      </div>

      {open && (
        <Dialog open={open} onClose={closeDialog} fullWidth>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogContent style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            <input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="Project Name" />
            <input type="date" value={form.start_date || ''} onChange={e => setForm({...form, start_date: e.target.value})} />
            <select value={form.client_id || ''} onChange={e => setForm({...form, client_id: e.target.value})}>
              <option value="">Select Client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {form.id === undefined ? (
              <div style={{display:'flex',flexDirection:'column'}}>
                {products.map(p => (
                  <label key={p.id}>
                    <input
                      type="checkbox"
                      value={p.id}
                      checked={form.product_ids.includes(p.id)}
                      onChange={() => toggleProduct(p.id)}
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            ) : (
              <div>
                <strong>Products:</strong>
                <ul>
                  {(form.products || []).map((p,i) => (
                    <li key={i}>{p.name} ({p.quantity})</li>
                  ))}
                </ul>
              </div>
            )}
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
