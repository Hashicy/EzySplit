import { Link } from 'react-router-dom';
import '../styles/HomePage.css';
import preview from '../assets/app-Logo.jpg';

export default function HomePage() {
  return (
    <div className="home container">
      <section className="hero">
        <div className="hero-left">
          <h1>Split bills, settle faster.</h1>
          <p>EzySplit makes group expenses painless. Track who paid, split uneven shares, and get a minimal set of payments to settle up.</p>
          <div className="cta">
            <Link to="/signup" className="btn btn-primary">Get started — it's free</Link>
            <Link to="/login" className="btn" style={{ marginLeft: 8 }}>Log in</Link>
          </div>
        </div>
        <div className="hero-right">
          <div className="mockup">  
            <img src={preview} alt="App Logo" />
</div>
        </div>
      </section>

      <section className="features">
        <h2>Why EzySplit?</h2>
        <div className="feature-grid">
          <div className="feature">
            <h4>Automatic settlements</h4>
            <p>We compute the minimal number of payments required so you worry less about IOUs.</p>
          </div>
          <div className="feature">
            <h4>Flexible splits</h4>
            <p>Equal splits, percentage splits, or custom fixed shares — handle any scenario.</p>
          </div>
          <div className="feature">
            <h4>Group-friendly</h4>
            <p>Create groups, add friends, and keep history of shared expenses.</p>
          </div>
          <div className="feature">
            <h4>Privacy-first</h4>
            <p>Your data stays scoped to your account. We do not share your financial details.</p>
          </div>
        </div>
      </section>

      <section className="how">
        <h2>Get started in 3 steps</h2>
        <ol>
          <li>Create an account</li>
          <li>Add friends or groups</li>
          <li>Add expenses and settle up with minimal payments</li>
        </ol>
      </section>

      <section className="testimonials">
        <h2>Trusted by groups</h2>
        <blockquote>"EzySplit removed the awkwardness of chasing friends for money — highly recommended." — Priya</blockquote>
      </section>
    </div>
  );
}