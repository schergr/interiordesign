import Link from 'next/link';

export default function Nav() {
  return (
    <nav>
      <Link href="/">Dashboard</Link>
      <Link href="/vendors">Vendors</Link>
      <Link href="/products">Products</Link>
      <Link href="/clients">Clients</Link>
      <Link href="/projects">Projects</Link>
      <Link href="/leads">Leads</Link>
      <Link href="/contracts">Contracts</Link>
      <Link href="/admin">Admin</Link>
    </nav>
  );
}
