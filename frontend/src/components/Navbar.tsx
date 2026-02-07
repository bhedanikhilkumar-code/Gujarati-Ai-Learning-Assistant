import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-slate-900 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold">
          Notes Sharing
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/notes">Notes</Link>
          {user && <Link to="/dashboard">Dashboard</Link>}
          {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <button onClick={handleLogout} className="rounded bg-red-500 px-3 py-1">
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
