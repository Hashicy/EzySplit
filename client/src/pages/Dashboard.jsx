import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div className="container">
      <h2>Dashboard</h2>
      <p>Logged in as: <strong>{user?.email}</strong></p>
      <p>This is a protected page. Next steps: add expenses CRUD, groups, etc.</p>
    </div>
  );
}