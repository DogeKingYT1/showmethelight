import '../styles/globals.css';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  
  const getPageTitle = () => {
    const pathname = router.pathname;
    if (pathname === '/') return 'Home';
    if (pathname === '/posts') return 'Posts';
    if (pathname === '/admin') return 'Admin';
    if (pathname.startsWith('/posts/')) return 'Post';
    return 'ShowMeTheLight';
  };

  return (
    <Layout title={getPageTitle()}>
      <Component {...pageProps} />
    </Layout>
  );
}
