import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { Button, TextField } from "@mui/material";

/**
 * A component that renders a sign in form.
 * It uses the useAuth hook to get the signIn function, which is called when the form is submitted.
 * The component also uses the useState hook to store the email and password state.
 * If the signIn function returns an error, it will display an alert with the error message.
 */
function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  /**
   * Handles the registration form submission.
   * Prevents the default form submission behavior and calls the signIn function.
   * If the signIn function returns an error, it will display an alert with the error message.
   * @param {any} e - The form submission event.
   */
  const handleRegister = async (e: any) => {
    e.preventDefault();

    const result = await signIn(email, password);
    if(!result.success){
      alert(result.message);
    }
  }

  return (
    <div className='w-screen h-screen flex flex-col gap-5 items-center justify-center'>
      <h2>Sign In</h2>
      <form method='post' onSubmit={handleRegister} className='flex flex-col gap-5'>
        <TextField id="email" label="Email" variant="outlined" name='email' onChange={(e) => setEmail(e.target.value)} />
        <TextField id="password" label="Password" type='password' variant="outlined" name='password' onChange={(e) => setPassword(e.target.value)} />

        <Button type='submit' variant='contained'>Sign In</Button>
      </form>
    </div>
  )
}

export default Login
