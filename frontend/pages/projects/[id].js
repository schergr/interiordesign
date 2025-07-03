import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { putData } from '../../lib/api.js';

const API = 'http://localhost:5000';

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState({ name: '', start_date: '', client_id: '' });
  const [clients, setClients] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/projects/${id}`).then(r => r.json()).then(setProject);
    fetch(`${API}/clients`).then(r => r.json()).then(setClients);
  }, [id]);

  const save = async () => {
    await putData(`${API}/projects/${id}`, project);
    setMessage('Saved');
  };

  return (
    <main>
      <h1>Project Details</h1>
      {message && <p className="message">{message}</p>}
      <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
        <input value={project.name || ''} onChange={e => setProject({...project,name:e.target.value})} placeholder="Project Name" />
        <input type="date" value={project.start_date || ''} onChange={e => setProject({...project,start_date:e.target.value})} />
        <select value={project.client_id || ''} onChange={e => setProject({...project,client_id:e.target.value})}>
          <option value="">Select Client</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <Button onClick={save} style={{marginTop:'1rem'}}>Save</Button>
    </main>
  );
}
