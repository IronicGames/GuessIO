import '@styles/globals.css';
import Logo from '@ui/Logo';
import Login from '@components/ui/Header/Login';
import { ProfileDropdown } from '@components/ui/Header/ProfileDropdown';
import { useAuth } from '@/app/providers/auth-provider';

export default function Header() {
  const { isLoggedIn } = useAuth();
  return (
    <main
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <Logo className="fixed top-0 left-4" />
      {isLoggedIn ? <ProfileDropdown /> : <Login />}
    </main>
  );
}
