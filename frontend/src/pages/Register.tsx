import { Button, TextField } from '@mui/material'
import { useState } from 'react'
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';

/**
 * Register page component
 * @returns {JSX.Element} A React component that renders a registration form
 */
function Register() {
    const { register } = useAuth();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<{email: string, password: string} | null>(null);
    let navigate = useNavigate();
    
    /**
     * Handles the registration form submission.
     * Prevents the default form submission behavior and calls the register function.
     * If the registration is not successful, displays an alert with the error message.
     * @param {any} e - The form submission event.
     */
    const handleRegister = async (e: any) => {
        e.preventDefault();
        
        const result = await register(email, password);
        if(!result.success){
            setError({email: result.email, password: result.password});
        }else{
            alert(result.message + ' Please Log in now!');
            navigate('/login');
        }
    }
    
    return (
        <div className='w-screen h-screen flex flex-col gap-5 items-center justify-center'>
            <h2>Register</h2>
            <form method='post' onSubmit={handleRegister} className='flex flex-col gap-5'>
                <TextField id="email" label="Email" variant="outlined" name='email' onChange={(e) => setEmail(e.target.value)} error={error && error.email !== '' ? true : false} helperText={error?.email}/>
                <TextField id="password" label="Password" type='password' variant="outlined" name='password' onChange={(e) => setPassword(e.target.value)} error={error && error.password !== '' ? true : false} helperText={error?.password}/>

                <Button type='submit' variant='contained'>Register</Button>
            </form>
        </div>
    )
}

export default Register
