import React, { useState } from 'react';
import { login, loginWithOtp, generateOtp } from '../auth/authService';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';

const LoginPage = () => {
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let data;
      if (isOtpMode) {
        data = await loginWithOtp(username, otp);
      } else {
        data = await login(username, password);
      }

      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  const handleGenerateOtp = async () => {
    try {
      await generateOtp(username);
      setOtpSent(true);
      alert('OTP sent to console (Mock)');
    } catch (err) {
      setError('Failed to generate OTP');
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {isOtpMode ? 'Login with OTP' : 'Login'}
        </h2>

        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {!isOtpMode ? (
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">OTP</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <button type="button" className="btn" style={{ width: 'auto' }} onClick={handleGenerateOtp} disabled={!username}>
                  {otpSent ? 'Resend' : 'Send'}
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="btn">
            Sign In
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            className="btn-link"
            onClick={() => { setIsOtpMode(!isOtpMode); setOtpSent(false); setError(''); }}
          >
            {isOtpMode ? 'Login with Password' : 'Login via OTP'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
