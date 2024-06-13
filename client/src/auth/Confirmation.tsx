import React, { useState } from 'react';
import './auth.css';
import { useAppContext } from '../store';
import { apiCall } from '../helpers/DataAccess';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Confirmation: React.FC = () => {
    const [code, setCode] = useState<string>('');

    const { showLoading } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCode(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const query = new URLSearchParams(location.search);
        const email = query.get('email');

        if (!email) {
            toast.error("No email provided")
            return;
        }

        if (!code) {
            toast.error("No code provided")
            return;
        }

        showLoading(true);
        const res = await apiCall({ method: 'POST', parameters: { confirmationCode: code, email, apiGate: 'confirm-email' } });

        showLoading(false);
        
        console.log(res)

        if (res && res.message) {
            toast.success(res.message)
            navigate("/login", { replace: true });
        }
    };


    return (
        <div className="login-page">
            <h1>Task Board</h1>
            <div className="content">
                <h2 className='title'>Confirm code which was sent to your email box! </h2>
                <form className="form" onSubmit={handleSubmit}>
                    <div className="input-box">
                        <label htmlFor="code">Code:</label>
                        <input
                            type="text"
                            id="code"
                            value={code}
                            onChange={handleCodeChange}
                        />
                    </div>
                    <div className='actions'>
                        <button type="submit" className="main-btn">Submit</button>
                    </div>
                </form>
            </div>
        </div>

    );
};

export default Confirmation;