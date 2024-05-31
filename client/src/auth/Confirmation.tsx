import React, { useState } from 'react';
import './auth.css';

const Confirmation: React.FC = () => {
    const [code, setCode] = useState<string>('');

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCode(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };


    return (
        <div className="login-page">
            <h1>Task Board</h1>
            <div className="content">
                <h2 className='title'>Confirm code </h2>
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
                        <button type="submit">Submit</button>
                    </div>
                </form>
            </div>
        </div>

    );
};

export default Confirmation;