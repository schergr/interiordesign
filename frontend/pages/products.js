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

export default function Products() {
  const emptyProduct = { sku: '', name: '', price: '', vendor_id: '' };

  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const fetchProducts = async () => {
    const res = await fetch(`${API}/products`);
    const data = await res.json();
    setProducts(data);
  };

  const handleRowClick = async (params) => {
    const res = await fetch(`${API}/products/${params.row.id}`);
    const data = await res.json();
    setForm(data);
    setOpen(true);
  };

  const closeDialog = () => { setOpen(false); };

  const saveDialog = async () => {
    if (form.id === undefined) {
      await fetch(`${API}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else {
      await putData(`${API}/products/${form.id}`, form);
    }
    setOpen(false);
    fetchProducts();
  };

  const handleDeleteClick = (id) => async () => {
    if (!window.confirm('Delete this product?')) return;
    await deleteData(`${API}/products/${id}`);
    fetchProducts();
  };

  const fetchVendors = async () => {
    const res = await fetch(`${API}/vendors`);
    const data = await res.json();
    setVendors(data);
  };

  useEffect(() => { fetchProducts(); fetchVendors(); }, []);

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  const columns = [
    { field: 'sku', headerName: 'SKU', flex: 1 },
    { field: 'name', headerName: 'Name', flex: 1 },
    {
      field: 'price',
      headerName: 'Price',
      flex: 1,
      valueFormatter: ({ value }) =>
        value === undefined || value === null || value === '' ||
        !Number.isFinite(Number(value))
          ? ''
          : currencyFormatter.format(Number(value))
    },
    { field: 'vendor', headerName: 'Vendor', flex: 1 },
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
      <h1>Products</h1>
      {message && <p className="message">{message}</p>}
      <button onClick={() => { setForm(emptyProduct); setOpen(true); }}>New Product</button>
      <div style={{ width: '100%' }}>
        <DataGrid
          autoHeight
          rows={products}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={handleRowClick}
          disableRowSelectionOnClick
        />
      </div>

      {open && (
        <Dialog open={open} onClose={closeDialog} fullWidth>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogContent style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            <input value={form.sku || ''} onChange={e => setForm({...form, sku: e.target.value})} placeholder="SKU" />
            <input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="Name" />
            <input value={form.price || ''} onChange={e => setForm({...form, price: e.target.value})} placeholder="Price" />
            <select value={form.vendor_id || ''} onChange={e => setForm({...form, vendor_id: e.target.value})}>
              <option value="">Select Vendor</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
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
