import { useState, useEffect } from 'react';

const API = 'http://localhost:3000';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');

  const fetchVendors = async () => {
    const res = await fetch(`${API}/vendors`);
    const data = await res.json();
    setVendors(data);
  };

  useEffect(() => { fetchVendors(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await fetch(`${API}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, contact_info: contact })
    });
    setName('');
    setContact('');
    fetchVendors();
  };

  return (
    <main>
      <h1>Vendors</h1>
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
