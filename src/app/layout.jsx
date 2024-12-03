import '../../styles/globals.css';
import { getNavbarData } from '../utils/content';
import Navbar from '../components/Navbar';

export default async function RootLayout({ children }) {
  const navbarData = await getNavbarData();

  return (
    <html lang="en">
      <body>
      <Navbar {...navbarData} />
        {children}
      </body>
    </html>
  );
}
