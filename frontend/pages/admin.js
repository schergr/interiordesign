import { useState } from 'react';

const API = 'http://localhost:5000';
const MODELS = [
  'vendors','products','projects','productprojects','inventory','clients',
  'employees','leadstages','leads','contractstatuses','contracts','tasks',
  'rooms','items','proposals','invoices','notes'
];

export default function Admin() {
  const [model, setModel] = useState('vendors');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const doExport = () => {
    window.open(`${API}/export/${model}`, '_blank');
  };

  const doImport = async () => {
    if (!file) return;
    const text = await file.text();
    await fetch(`${API}/import/${model}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: text,
    });
    setMessage('Imported');
  };

  return (
    <main>
      <h1>Admin</h1>
      {message && <p className="message">{message}</p>}
      <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
        <select value={model} onChange={e => setModel(e.target.value)}>
          {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <button onClick={doExport}>Export</button>
        <input type="file" onChange={e => setFile(e.target.files[0])} />
        <button onClick={doImport}>Import</button>
      </div>
    </main>
  );
}
