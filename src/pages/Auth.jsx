import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock } from 'lucide-react';
import './Auth.css';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      // App.jsx will automatically hide this component when currentUser updates
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email ou password incorretos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este email já está registado.');
      } else if (err.code === 'auth/weak-password') {
        setError('A password tem de ter pelo menos 6 caracteres.');
      } else {
        setError('Ocorreu um erro inesperado. Tenta novamente.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <Sparkles className="auth-icon" size={40} />
          <h2>{isLogin ? 'Bem-vinda de volta' : 'Criar Conta'}</h2>
          <p>O teu guarda-roupa digital está à tua espera!</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="glass-input auth-input"
              />
            </div>
          </div>
          <div className="form-group">
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="glass-input auth-input"
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="glass-button primary w-full auth-btn" 
            disabled={loading || !email || !password}
          >
            {loading ? 'A carregar...' : (isLogin ? 'Entrar' : 'Registar')}
          </button>
        </form>

        <div className="auth-toggle">
          <span>{isLogin ? 'Não tens conta?' : 'Já tens conta?'}</span>
          <button 
            type="button" 
            className="text-btn"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
          >
            {isLogin ? 'Cria uma aqui' : 'Faz Login'}
          </button>
        </div>
      </div>
    </div>
  );
};
