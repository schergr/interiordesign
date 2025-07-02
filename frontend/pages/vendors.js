import { useState, useEffect } from 'react';

const API = 'http://localhost:5000';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');

  const fetchVendors = async () => {
    const res = await fetch(`${API}/vendors`);
    const data = await res.json();
    setVendors(data);
  };

  useEffect(() => { fetchVendors(); }, []);

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

  return (
    <main>
      <h1>Vendors</h1>
      {message && <p className="message">{message}</p>}
      <form onSubmit={submit} className="form">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
        <input value={contact} onChange={e => setContact(e.target.value)} placeholder="Contact Info" />
        <button type="submit">Add</button>
      </form>
      <ul>
        {vendors.map(v => (
          <li key={v.id}>{v.name} - {v.contact_info}</li>
        ))}
      </ul>
    </main>
  );
}
