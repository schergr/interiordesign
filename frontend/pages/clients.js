import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';

const API = 'http://localhost:5000';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [secondaryEmail, setSecondaryEmail] = useState('');
  const [referralType, setReferralType] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [contact, setContact] = useState('');
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState('');

  const fetchClients = async () => {
    const res = await fetch(`${API}/clients`);
    const data = await res.json();
    setClients(data);
  };

  const fetchEmployees = async () => {
    const res = await fetch(`${API}/employees`);
    const data = await res.json();
    setEmployees(data);
  };

  useEffect(() => { fetchClients(); fetchEmployees(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        primary_phone: primaryPhone,
        primary_email: primaryEmail,
        secondary_phone: secondaryPhone,
        secondary_email: secondaryEmail,
        referral_type: referralType,
        employee_id: employeeId || null,
        contact_info: contact
      })
    });
    if (res.ok) {
      setMessage(`Added client: ${firstName} ${lastName}`);
      fetchClients();
    } else {
      setMessage('Error adding client');
    }
    setFirstName('');
    setLastName('');
    setPrimaryPhone('');
    setPrimaryEmail('');
    setSecondaryPhone('');
    setSecondaryEmail('');
    setReferralType('');
    setEmployeeId('');
    setContact('');
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'primary_phone', headerName: 'Primary Phone', flex: 1 },
    { field: 'primary_email', headerName: 'Primary Email', flex: 1 },
    { field: 'referral_type', headerName: 'Referral Type', flex: 1 },
    { field: 'employee', headerName: 'Referred By', flex: 1 },
  ];

  return (
    <main>
      <h1>Clients</h1>
      {message && <p className="message">{message}</p>}
      <form onSubmit={submit} className="form" style={{flexWrap:'wrap'}}>
        <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" required />
        <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" required />
        <input value={primaryPhone} onChange={e => setPrimaryPhone(e.target.value)} placeholder="Primary Phone" />
        <input value={primaryEmail} onChange={e => setPrimaryEmail(e.target.value)} placeholder="Primary Email" />
        <input value={secondaryPhone} onChange={e => setSecondaryPhone(e.target.value)} placeholder="Secondary Phone" />
        <input value={secondaryEmail} onChange={e => setSecondaryEmail(e.target.value)} placeholder="Secondary Email" />
        <input value={referralType} onChange={e => setReferralType(e.target.value)} placeholder="Referral Type" />
        <select value={employeeId} onChange={e => setEmployeeId(e.target.value)}>
          <option value="">Referred By</option>
          {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
        </select>
        <input value={contact} onChange={e => setContact(e.target.value)} placeholder="Other Contact Info" />
        <button type="submit">Add</button>
      </form>
      <div style={{ width: '100%' }}>
        <DataGrid
          autoHeight
          rows={clients}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
        />
      </div>
    </main>
  );
}
