import Link from 'next/link';

export default function Nav() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/vendors">Vendors</Link>
      <Link href="/products">Products</Link>
      <Link href="/clients">Clients</Link>
      <Link href="/projects">Projects</Link>
      <Link href="/leads">Leads</Link>
    </nav>
  );
}
