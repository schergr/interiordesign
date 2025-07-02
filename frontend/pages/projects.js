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

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [clientId, setClientId] = useState('');
  const [productIds, setProductIds] = useState([]);
  const [message, setMessage] = useState('');
  const [rowModesModel, setRowModesModel] = useState({});

  const fetchProjects = async () => {
    const res = await fetch(`${API}/projects`);
    const data = await res.json();
    setProjects(data);
  };

  const processRowUpdate = async (newRow) => {
    await putData(`${API}/projects/${newRow.id}`, newRow);
    fetchProjects();
    return newRow;
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
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

  const handleRowEditStart = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const fetchProducts = async () => {
    const res = await fetch(`${API}/products`);
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => { fetchProjects(); fetchClients(); fetchProducts(); }, []);

  const toggleProduct = (id) => {
    setProductIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        start_date: startDate,
        client_id: clientId || null,
        product_ids: productIds
      })
    });
    if (res.ok) {
      setMessage(`Added project: ${name}`);
      fetchProjects();
    } else {
      setMessage('Error adding project');
    }
    setName('');
    setStartDate('');
    setClientId('');
    setProductIds([]);
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'start_date', headerName: 'Start Date', flex: 1 },
    { field: 'client', headerName: 'Client', flex: 1 },
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
      <h1>Projects</h1>
      {message && <p className="message">{message}</p>}
      <form onSubmit={submit} className="form">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Project Name" required />
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <select value={clientId} onChange={e => setClientId(e.target.value)}>
          <option value="">Select Client</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div style={{display:'flex',flexDirection:'column'}}>
          {products.map(p => (
            <label key={p.id}>
              <input
                type="checkbox"
                value={p.id}
                checked={productIds.includes(p.id)}
                onChange={() => toggleProduct(p.id)}
              />
              {p.name}
            </label>
          ))}
        </div>
        <button type="submit">Add</button>
      </form>
      <div style={{ width: '100%' }}>
        <DataGrid
          autoHeight
          rows={projects}
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
