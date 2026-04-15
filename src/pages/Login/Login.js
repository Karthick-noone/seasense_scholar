import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, LogIn, ShieldCheck, Zap, Headphones } from 'lucide-react';
import './Login.css';
import logo from './../../assets/img/logo.png';
import { loginUser } from './../../services/authService';
import { secureStorage } from "../../utils/secureStorage";

const Login = ({ onLogin }) => {
  const [scholarId, setScholarId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginUser({
        user_id: scholarId,
        pwd: password,
      });

      const { token, user, scholar, company_details, last_work_details } = res.data;

      secureStorage.setToken(token);
      secureStorage.setUser(user);
      secureStorage.setScholar(scholar);
      secureStorage.setCompany(company_details);
      secureStorage.setWork(last_work_details);


      navigate("/dashboard");

    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* LEFT SIDE - CONTENT */}
      <div className="login-brand">
        <div className="brand-content">
          <div className="brand-logo">
            <ShieldCheck size={45} />
            <img src={logo} alt="Logo" className="login-logo-image" />
          </div>

          <h1>Access your research workspace</h1>

          <p>
            A centralized platform for research scholars to manage publications,
            track progress, collaborate with mentors, and streamline academic workflows.
          </p>

          <div className="feature-list">

            <div className="feature-item">
              <Zap size={20} />
              <div>
                <strong>Smart research tracking</strong>
                <span>Manage papers, progress & milestones</span>
              </div>
            </div>

            <div className="feature-item">
              <Headphones size={20} />
              <div>
                <strong>Supervisor collaboration</strong>
                <span>Connect with guides & review feedback</span>
              </div>
            </div>

            <div className="feature-item">
              <ShieldCheck size={20} />
              <div>
                <strong>Secure academic access</strong>
                <span>Protected data & institutional privacy</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="login-form-container">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome back</h2>
            <p>Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label>Scholar ID</label>
              <div className="input-field">
                <User size={18} className="field-icon" />
                <input
                  type="text"
                  value={scholarId}
                  onChange={(e) => setScholarId(e.target.value)}
                  placeholder="Enter your scholar ID"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-field">
                <Lock size={18} className="field-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div><span>Signing In...</span>
                </>) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>

            {/* <div className="demo-info">
              <p>Demo: user / user123</p>
            </div> */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;