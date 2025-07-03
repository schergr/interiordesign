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

export default function Vendors() {
  const emptyVendor = {
    name: '',
    contact_info: '',
    first_name: '',
    last_name: '',
    primary_email: '',
    secondary_email: '',
    primary_phone: '',
    secondary_phone: '',
    description: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip_code: '',
    tax_id: ''
  };

  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState(emptyVendor);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const fetchVendors = async () => {
    const res = await fetch(`${API}/vendors`);
    const data = await res.json();
    setVendors(data);
  };

  useEffect(() => { fetchVendors(); }, []);

  const handleDeleteClick = (id) => async () => {
    if (!window.confirm('Delete this vendor?')) return;
    await deleteData(`${API}/vendors/${id}`);
    fetchVendors();
  };

  const handleRowClick = async (params) => {
    const res = await fetch(`${API}/vendors/${params.row.id}`);
    const data = await res.json();
    setForm(data);
    setOpen(true);
  };

  const closeDialog = () => { setOpen(false); };

  const saveDialog = async () => {
    if (form.id === undefined) {
      await fetch(`${API}/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
    } else {
      await putData(`${API}/vendors/${form.id}`, form);
    }
    setOpen(false);
    fetchVendors();
  };

  const columns = [
    { field: 'name', headerName: 'Vendor', flex: 1 },
    { field: 'primary_email', headerName: 'Primary Email', flex: 1 },
    { field: 'primary_phone', headerName: 'Primary Phone', flex: 1 },
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
      <h1>Vendors</h1>
      <button onClick={() => { setForm(emptyVendor); setOpen(true); }}>New Vendor</button>
      {message && <p className="message">{message}</p>}
      <div style={{ width: '100%' }}>
        <DataGrid
          autoHeight
          rows={vendors}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={handleRowClick}
          disableRowSelectionOnClick
        />
      </div>

      {open && (
        <Dialog open={open} onClose={closeDialog} fullWidth>
          <DialogTitle>Edit Vendor</DialogTitle>
          <DialogContent style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            <input value={form.name || ''} onChange={e => setForm({...form,name:e.target.value})} placeholder="Name" />
            <input value={form.first_name || ''} onChange={e => setForm({...form,first_name:e.target.value})} placeholder="First Name" />
            <input value={form.last_name || ''} onChange={e => setForm({...form,last_name:e.target.value})} placeholder="Last Name" />
            <input value={form.primary_email || ''} onChange={e => setForm({...form,primary_email:e.target.value})} placeholder="Primary Email" />
            <input value={form.secondary_email || ''} onChange={e => setForm({...form,secondary_email:e.target.value})} placeholder="Secondary Email" />
            <input value={form.primary_phone || ''} onChange={e => setForm({...form,primary_phone:e.target.value})} placeholder="Primary Phone" />
            <input value={form.secondary_phone || ''} onChange={e => setForm({...form,secondary_phone:e.target.value})} placeholder="Secondary Phone" />
            <input value={form.description || ''} onChange={e => setForm({...form,description:e.target.value})} placeholder="Description" />
            <input value={form.address1 || ''} onChange={e => setForm({...form,address1:e.target.value})} placeholder="Address" />
            <input value={form.address2 || ''} onChange={e => setForm({...form,address2:e.target.value})} placeholder="Address 2" />
            <input value={form.city || ''} onChange={e => setForm({...form,city:e.target.value})} placeholder="City" />
            <input value={form.state || ''} onChange={e => setForm({...form,state:e.target.value})} placeholder="State" />
            <input value={form.zip_code || ''} onChange={e => setForm({...form,zip_code:e.target.value})} placeholder="Zip" />
            <input value={form.tax_id || ''} onChange={e => setForm({...form,tax_id:e.target.value})} placeholder="Tax ID" />
            <div>
              <strong>Products:</strong>
              <ul>
                {(form.products || []).map((p,i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
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
