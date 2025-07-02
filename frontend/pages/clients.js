import { useState, useEffect } from 'react';

const API = 'http://localhost:3000';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');

  const fetchClients = async () => {
    const res = await fetch(`${API}/clients`);
    const data = await res.json();
    setClients(data);
  };

  useEffect(() => { fetchClients(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await fetch(`${API}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, contact_info: contact })
    });
    setName('');
    setContact('');
    fetchClients();
  };

  return (
    <main>
      <h1>Clients</h1>
      <form onSubmit={submit} className="form">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
        <input value={contact} onChange={e => setContact(e.target.value)} placeholder="Contact Info" />
        <button type="submit">Add</button>
      </form>
      <ul>
        {clients.map(c => (
          <li key={c.id}>{c.name} - {c.contact_info}</li>
        ))}
      </ul>
    </main>
  );
}
