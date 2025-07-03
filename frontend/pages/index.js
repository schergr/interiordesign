import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const API = 'http://localhost:5000';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [recent, setRecent] = useState([]);
  const [form, setForm] = useState({});
  const [dialogType, setDialogType] = useState('');
  const [statusMap, setStatusMap] = useState({});

  useEffect(() => {
    fetch(`${API}/projects`).then(r => r.json()).then(setProjects);
    fetch(`${API}/tasks`).then(r => r.json()).then(d => setTasks(d.filter(t => !t.completed)));
    fetch(`${API}/contracts`).then(r => r.json()).then(data => {
      setContracts(data);
      const map = {};
      data.forEach(c => { if (c.project_id) map[c.project_id] = c.status; });
      setStatusMap(map);
    });
    fetch(`${API}/recent`).then(r => r.json()).then(setRecent);
  }, []);

  const openDialog = (type) => {
    setDialogType(type);
    setForm({});
  };

  const closeDialog = () => setDialogType('');

  const saveDialog = async () => {
    let url = '';
    switch (dialogType) {
      case 'vendor':
        url = `${API}/vendors`;
        break;
      case 'client':
        url = `${API}/clients`;
        break;
      case 'lead':
        url = `${API}/leads`;
        if (!form.stage_id) form.stage_id = 1;
        break;
      case 'contract':
        url = `${API}/contracts`;
        break;
      case 'project':
        url = `${API}/projects`;
        break;
      default:
        return;
    }
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    closeDialog();
    // refresh basic lists
    fetch(`${API}/projects`).then(r => r.json()).then(setProjects);
    fetch(`${API}/tasks`).then(r => r.json()).then(d => setTasks(d.filter(t => !t.completed)));
    fetch(`${API}/contracts`).then(r => r.json()).then(setContracts);
  };

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="dashboard-grid">
        <div className="left-col">
          <div className="section">
            <h2>Active Projects ({projects.length})</h2>
            <div className="cards">
              {projects.map(p => (
                <Link key={p.id} href={`/projects/${p.id}`} className="card-link">
                  <div className="card fixed">
                    <div>{p.name}</div>
                    <div style={{fontSize:'0.8rem'}}>{p.client}</div>
                    <div style={{fontSize:'0.8rem'}}>{statusMap[p.id] || ''}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="section">
            <h2>Active Tasks ({tasks.length})</h2>
            <ul>
              {tasks.map(t => (<li key={t.id}>{t.name}</li>))}
            </ul>
          </div>
          <div className="section">
            <h2>Contracts ({contracts.length})</h2>
            <ul>
              {contracts.map(c => (
                <li key={c.id}>{c.project || c.client || c.id} - {c.status}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="right-col">
          <div className="section">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <Button onClick={() => openDialog('vendor')}><AddIcon /> Vendor</Button>
              <Button onClick={() => openDialog('client')}><AddIcon /> Client</Button>
              <Button onClick={() => openDialog('lead')}><AddIcon /> Lead</Button>
              <Button onClick={() => openDialog('contract')}><AddIcon /> Contract</Button>
              <Button onClick={() => openDialog('project')}><AddIcon /> Project</Button>
            </div>
          </div>
          <div className="section">
            <h2>Recent Updates ({recent.length})</h2>
            <ul>
              {recent.map((item, i) => (
                <li key={i}>{item._type}: {item.name || item.description || item.id}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <Dialog open={dialogType !== ''} onClose={closeDialog} fullWidth>
        <DialogTitle>New {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}</DialogTitle>
        <DialogContent style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
          {dialogType === 'vendor' && (
            <input value={form.name || ''} onChange={e => setForm({...form,name:e.target.value})} placeholder="Name" />
          )}
          {dialogType === 'client' && (
            <input value={form.name || ''} onChange={e => setForm({...form,name:e.target.value})} placeholder="Name" />
          )}
          {dialogType === 'lead' && (
            <>
              <input value={form.name || ''} onChange={e => setForm({...form,name:e.target.value})} placeholder="Name" />
              <input value={form.contact_info || ''} onChange={e => setForm({...form,contact_info:e.target.value})} placeholder="Contact Info" />
            </>
          )}
          {dialogType === 'contract' && (
            <>
              <input value={form.client_id || ''} onChange={e => setForm({...form,client_id:e.target.value})} placeholder="Client ID" />
              <input value={form.project_id || ''} onChange={e => setForm({...form,project_id:e.target.value})} placeholder="Project ID" />
              <input value={form.status_id || ''} onChange={e => setForm({...form,status_id:e.target.value})} placeholder="Status ID" />
            </>
          )}
          {dialogType === 'project' && (
            <>
              <input value={form.name || ''} onChange={e => setForm({...form,name:e.target.value})} placeholder="Project Name" />
              <input type="date" value={form.start_date || ''} onChange={e => setForm({...form,start_date:e.target.value})} />
              <input value={form.client_id || ''} onChange={e => setForm({...form,client_id:e.target.value})} placeholder="Client ID" />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={saveDialog}>Save</Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
