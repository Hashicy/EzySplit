import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to={user ? '/dashboard' : '/'} className="brand">EzySplit</Link>
      </div>
      <div className="nav-right">
        {user ? (
          <>
            <span className="user-email">{user.username || user.name}</span>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/expenses" className="nav-link">Expenses</Link>
            <Link to="/groups" className="nav-link">Groups</Link>
            <Link to="/users" className="nav-link">Users</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
            <button onClick={handleLogout} className="btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}