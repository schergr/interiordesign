import '../styles/globals.css';
import Nav from '../components/Nav';
import { CssBaseline } from '@mui/material';

export default function App({ Component, pageProps }) {
  return (
    <>
      <CssBaseline />
      <Nav />
      <Component {...pageProps} />
    </>
  );
}
