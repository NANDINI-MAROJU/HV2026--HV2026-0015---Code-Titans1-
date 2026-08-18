import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('admin@campus.edu');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/');
      else navigate('/complaints/new');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800">Campus Login</h2>
      <p className="text-xs text-slate-500 mt-1">Sign in to track, manage, or report campus issues</p>

      {error && <div className="mt-4 p-2 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200">{error}</div>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border p-2.5 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border p-2.5 rounded-lg text-sm"
          />
        </div>

        <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
          Sign In
        </button>

        <div className="mt-4 pt-4 border-t text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">Demo Accounts (Password: <code>password123</code>):</p>
          <p>• Admin: <code>admin@campus.edu</code></p>
          <p>• Student: <code>student@campus.edu</code></p>
          <p>• Staff: <code>ramesh@campus.edu</code></p>
        </div>
      </form>
    </div>
  );
}
