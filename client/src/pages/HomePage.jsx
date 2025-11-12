import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="container">
      <h1>Welcome to EzySplit</h1>
      <p>Split expenses with friends easily. Start by logging in or creating an account.</p>
      <div style={{ marginTop: 20 }}>
        <Link to="/login" className="btn">Login</Link>
        <Link to="/signup" className="btn btn-primary" style={{ marginLeft: 10 }}>Sign Up</Link>
      </div>
    </div>
  );
}