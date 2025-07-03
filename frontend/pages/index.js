import Link from 'next/link';
import { useEffect, useState } from 'react';

const API = 'http://localhost:5000';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    fetch(`${API}/projects`).then(r => r.json()).then(setProjects);
    fetch(`${API}/tasks`).then(r => r.json()).then(d => setTasks(d.filter(t => !t.completed)));
    fetch(`${API}/contracts`).then(r => r.json()).then(setContracts);
    fetch(`${API}/recent`).then(r => r.json()).then(setRecent);
  }, []);

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="dashboard-grid">
        <div className="left-col">
          <div className="section">
            <h2>Active Projects ({projects.length})</h2>
            <div className="cards">
              {projects.map(p => (
                <div key={p.id} className="card">{p.name}</div>
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
            <ul className="links">
              <li><Link href="/vendors">New Vendor</Link></li>
              <li><Link href="/clients">New Client</Link></li>
              <li><Link href="/leads">New Lead</Link></li>
              <li><Link href="/contracts">New Contract</Link></li>
              <li><Link href="/projects">New Project</Link></li>
            </ul>
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
    </main>
  );
}
