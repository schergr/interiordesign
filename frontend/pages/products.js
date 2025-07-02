import { useState, useEffect } from 'react';
import {
  DataGrid,
  GridActionsCellItem,
  GridRowModes,
} from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { putData, deleteData } from '../lib/api.js';

const API = 'http://localhost:5000';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [message, setMessage] = useState('');
  const [rowModesModel, setRowModesModel] = useState({});

  const fetchProducts = async () => {
    const res = await fetch(`${API}/products`);
    const data = await res.json();
    setProducts(data);
  };

  const processRowUpdate = async (newRow) => {
    await putData(`${API}/products/${newRow.id}`, newRow);
    fetchProducts();
    return newRow;
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
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

  const handleRowEditStart = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  useEffect(() => { fetchProducts(); fetchVendors(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sku, name, price, vendor_id: vendorId || null })
    });
    if (res.ok) {
      setMessage(`Added product: ${name}`);
    } else {
      setMessage('Error adding product');
    }
    setSku('');
    setName('');
    setPrice('');
    setVendorId('');
    fetchProducts();
  };

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
        value === undefined || value === null || value === ''
          ? ''
          : currencyFormatter.format(Number(value))
    },
    { field: 'vendor', headerName: 'Vendor', flex: 1 },
    {
      field: 'actions',
      type: 'actions',
      getActions: (params) => {
        const inEdit = rowModesModel[params.id]?.mode === GridRowModes.Edit;
        return inEdit
          ? [
              <GridActionsCellItem
                key="save"
                icon={<SaveIcon />}
                label="Save"
                onClick={handleSaveClick(params.id)}
              />,
            ]
          : [
              <GridActionsCellItem
                key="edit"
                icon={<EditIcon />}
                label="Edit"
                onClick={handleEditClick(params.id)}
              />,
              <GridActionsCellItem
                key="delete"
                icon={<DeleteIcon />}
                label="Delete"
                onClick={handleDeleteClick(params.id)}
              />,
            ];
      },
    },
  ];

  return (
    <main>
      <h1>Products</h1>
      {message && <p className="message">{message}</p>}
      <form onSubmit={submit} className="form">
        <input value={sku} onChange={e => setSku(e.target.value)} placeholder="SKU" required />
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
        <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" />
        <select value={vendorId} onChange={e => setVendorId(e.target.value)}>
          <option value="">Select Vendor</option>
          {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <button type="submit">Add</button>
      </form>
      <div style={{ width: '100%' }}>
        <DataGrid
          autoHeight
          rows={products}
          columns={columns}
          getRowId={(row) => row.id}
          editMode="row"
          processRowUpdate={processRowUpdate}
          onRowEditStart={handleRowEditStart}
          onRowEditStop={handleRowEditStop}
          rowModesModel={rowModesModel}
          onRowModesModelChange={setRowModesModel}
          disableRowSelectionOnClick
        />
      </div>
    </main>
  );
}
