import React, { useEffect, useState } from 'react';
import './auth.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { useAppContext } from '../store';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { showLoading } = useAppContext();
  const { signIn, accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (accessToken)
      navigate('/');
  }, [accessToken, navigate]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add your login logic here
    if (!email || !password)
      return

    showLoading(true);
    signIn({ email, password }, () => {
      navigate('/');
    });
    showLoading(false);
  };

  return (
    <div className="login-page">
      <h1>Task Board</h1>
      <div className="content">
        <h2 className='title'>Login </h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="input-box">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
            />
          </div>
          <div className="input-box">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
          <div className='actions'>
            <button type="submit" className="main-btn">Login</button>
            or <Link className="link-back" to="/sign-up">SignUp</Link>
          </div>
        </form>
      </div>
    </div>

  );
};

export default Login;