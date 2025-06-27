import React, { useState } from 'react';
import { apiFetch } from '../api';

const API_URL = '/detection';

interface LoginResponse {
  refresh: string;
  access: string;
  username: string;
  email: string;
  user_id: number;
  role: string;
}

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        // Connexion via apiFetch
        const res = await apiFetch<LoginResponse>(`${API_URL}/login/`, {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        }, false);
        localStorage.setItem('token', res.access);
        localStorage.setItem('refresh', res.refresh);
        localStorage.setItem('username', res.username);
        localStorage.setItem('email', res.email);
        localStorage.setItem('role', res.role);
        window.location.href = '/dashboard';
      } else {
        // Inscription
        await apiFetch(`${API_URL}/register/`, {
          method: 'POST',
          body: JSON.stringify({ username, email, password }),
        }, false);
        setIsLogin(true);
        setError('Inscription réussie, veuillez vous connecter.');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la requête.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Connexion' : 'Créer un compte'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          )}
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="custom-btn">
            {isLogin ? 'Se connecter' : 'Créer un compte'}
          </button>
        </form>
        {error && <p style={{ color: '#e91e63', marginTop: 10 }}>{error}</p>}
        <p className="switch-mode">
          {isLogin ? "Pas de compte ? " : "Déjà inscrit ? "}
          <span onClick={() => { setIsLogin(!isLogin); setError(null); }}>
            {isLogin ? 'Créer un compte' : 'Se connecter'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
