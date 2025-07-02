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

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [rowModesModel, setRowModesModel] = useState({});

  const fetchVendors = async () => {
    const res = await fetch(`${API}/vendors`);
    const data = await res.json();
    setVendors(data);
  };

  const processRowUpdate = async (newRow) => {
    await putData(`${API}/vendors/${newRow.id}`, newRow);
    fetchVendors();
    return newRow;
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => async () => {
    if (!window.confirm('Delete this vendor?')) return;
    await deleteData(`${API}/vendors/${id}`);
    fetchVendors();
  };

  useEffect(() => { fetchVendors(); }, []);

  const handleRowEditStart = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, contact_info: contact })
    });
    if (res.ok) {
      setMessage(`Added vendor: ${name}`);
    } else {
      setMessage('Error adding vendor');
    }
    setName('');
    setContact('');
    fetchVendors();
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'contact_info', headerName: 'Contact Info', flex: 1 },
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
      <h1>Vendors</h1>
      {message && <p className="message">{message}</p>}
      <form onSubmit={submit} className="form">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
        <input value={contact} onChange={e => setContact(e.target.value)} placeholder="Contact Info" />
        <button type="submit">Add</button>
      </form>
      <div style={{ width: '100%' }}>
        <DataGrid
          autoHeight
          rows={vendors}
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
