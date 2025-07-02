import { useState, useEffect } from 'react';

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

  const fetchProjects = async () => {
    const res = await fetch(`${API}/projects`);
    const data = await res.json();
    setProjects(data);
  };

  const fetchClients = async () => {
    const res = await fetch(`${API}/clients`);
    const data = await res.json();
    setClients(data);
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
      <ul>
        {projects.map(p => (
          <li key={p.id}>
            {p.name} - {p.start_date || 'N/A'} - {p.client || 'No Client'}
          </li>
        ))}
      </ul>
    </main>
  );
}
