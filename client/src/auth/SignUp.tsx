import React, { useEffect, useState } from 'react';
import './auth.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../store';
import { apiCall } from '../helpers/DataAccess';
import { toast } from 'react-toastify';

const SignUp: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isFormValid, setIsFormValid] = useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (email && name && password && confirmPassword && password === confirmPassword)
            setIsFormValid(true)
        else 
            setIsFormValid(false)

        if(password && confirmPassword && password !== confirmPassword)
            setError("Passwords don't match")
        else if(password && confirmPassword && password === confirmPassword)
            setError("")

    }, [confirmPassword, email, name, password])

    const { showLoading } = useAppContext();

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(isFormValid)
        if (!isFormValid)
            return;

        showLoading(true);
        const res = await apiCall({ method: 'POST', parameters: { name, email, password, apiGate: 'register' } });
        showLoading(false);

        if (res && res.message) {
            toast.success(res.message)
            navigate(`/code-confirmation?email=${email}`, { replace: true })
        }

    };

    return (
        <div className="login-page">
            <h1> Task Board </h1>
            <div className="content">
                <h1 className="title">Sign Up</h1>
                <form className="form" onSubmit={handleSubmit}>
                    <div className="input-box">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            required
                            onChange={handleEmailChange}
                        />
                    </div>
                    <div className="input-box">
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            required
                            onChange={handleNameChange}
                        />
                    </div>
                    <div className="input-box">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            required
                            onChange={handlePasswordChange}

                        />
                    </div>
                    <div className="input-box">
                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            required
                            onChange={handleConfirmPasswordChange}
                        />
                    </div>

                    <div className="actions">
                        <button type="submit" className='main-btn' disabled={!isFormValid}>Create profile</button>
                        or <Link className="link-back" to="/login">Login</Link>
                    </div>
                    {error && <p className='error-text'>{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default SignUp;