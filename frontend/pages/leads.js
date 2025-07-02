import { useState, useEffect } from 'react';

const API = 'http://localhost:5000';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [stages, setStages] = useState([]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [stageId, setStageId] = useState('');
  const [message, setMessage] = useState('');

  const fetchLeads = async () => {
    const res = await fetch(`${API}/leads`);
    const data = await res.json();
    setLeads(data);
  };

  const fetchStages = async () => {
    const res = await fetch(`${API}/leadstages`);
    const data = await res.json();
    setStages(data);
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
      <ul>
        {leads.map(l => (
          <li key={l.id}>{l.name} - {l.stage}</li>
        ))}
      </ul>
    </main>
  );
}
