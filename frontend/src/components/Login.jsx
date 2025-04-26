import { useState } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const response = await fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      alert('Connexion réussie!');
    } else {
      alert('Erreur de connexion');
    }
  };

  return (
    <form onSubmit={handleLogin} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px', // <--- add this
        width: '300px',
        margin: 'auto',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0px 0px 10px rgba(0,0,0,0.3)'
    }}>
      <h2 style={{ textAlign: 'center' }}>Connexion</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
      />
      <button type="submit">
        Se connecter
      </button>
    </form>
  );
}

export default Login;
