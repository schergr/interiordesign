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

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [stages, setStages] = useState([]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [stageId, setStageId] = useState('');
  const [message, setMessage] = useState('');
  const [rowModesModel, setRowModesModel] = useState({});

  const fetchLeads = async () => {
    const res = await fetch(`${API}/leads`);
    const data = await res.json();
    setLeads(data);
  };

  const processRowUpdate = async (newRow) => {
    await putData(`${API}/leads/${newRow.id}`, newRow);
    fetchLeads();
    return newRow;
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
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

  const handleRowEditStart = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  useEffect(() => { fetchLeads(); fetchStages(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, contact_info: contact, stage_id: stageId })
    });
    if (res.ok) {
      setMessage(`Added lead: ${name}`);
      fetchLeads();
    } else {
      setMessage('Error adding lead');
    }
    setName('');
    setContact('');
    setStageId('');
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'stage', headerName: 'Stage', flex: 1 },
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
      <h1>Leads</h1>
      {message && <p className="message">{message}</p>}
      <form onSubmit={submit} className="form">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Lead Name" required />
        <input value={contact} onChange={e => setContact(e.target.value)} placeholder="Contact Info" />
        <select value={stageId} onChange={e => setStageId(e.target.value)} required>
          <option value="">Stage</option>
          {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button type="submit">Add</button>
      </form>
      <div style={{ width: '100%' }}>
        <DataGrid
          autoHeight
          rows={leads}
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
