import { useState, useEffect } from 'react';

const API = 'http://localhost:5000';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');

  const fetchClients = async () => {
    const res = await fetch(`${API}/clients`);
    const data = await res.json();
    setClients(data);
  };

  useEffect(() => { fetchClients(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, contact_info: contact })
    });
    if (res.ok) {
      setMessage(`Added client: ${name}`);
    } else {
      setMessage('Error adding client');
    }
    setName('');
    setContact('');
    fetchClients();
  };

  return (
    <main>
      <h1>Clients</h1>
      {message && <p className="message">{message}</p>}
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
