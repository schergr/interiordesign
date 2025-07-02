import { useState, useEffect } from 'react';

const API = 'http://localhost:3000';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [vendorId, setVendorId] = useState('');

  const fetchProducts = async () => {
    const res = await fetch(`${API}/products`);
    const data = await res.json();
    setProducts(data);
  };

  const fetchVendors = async () => {
    const res = await fetch(`${API}/vendors`);
    const data = await res.json();
    setVendors(data);
  };

  useEffect(() => { fetchProducts(); fetchVendors(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await fetch(`${API}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sku, name, price, vendor_id: vendorId || null })
    });
    setSku('');
    setName('');
    setPrice('');
    setVendorId('');
    fetchProducts();
  };

  return (
    <main>
      <h1>Products</h1>
      <form onSubmit={submit} className="form">
        <input value={sku} onChange={e => setSku(e.target.value)} placeholder="SKU" required />
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
        <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" />
        <select value={vendorId} onChange={e => setVendorId(e.target.value)}>
          <option value="">Select Vendor</option>
          {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <button type="submit">Add</button>
      </form>
      <ul>
        {products.map(p => (
          <li key={p.id}>{p.sku} - {p.name} - ${p.price} - {p.vendor}</li>
        ))}
      </ul>
    </main>
  );
}
