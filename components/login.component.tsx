"use client";

import { useEffect, useState } from 'react';
import { getFetcher } from '@/services/api.service';
import { RequestResponse } from '@/interfaces/api';
import { User } from '@prisma/client';
import { verifyPassword } from '@/lib/utils';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import NextLink from "next/link";
import '@/app/register/register.css';
import { useUser } from '../app/login/providers/user.provider';
import { useRouter } from 'next/navigation';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>(''); // Nuevo estado para mensaje de error genérico
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Vaciar el localStorage cuando se carga la página de login
    localStorage.removeItem('user');
    setUser(null);
  }, [setUser]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUsernameError('');
    setPasswordError('');
    setErrorMessage('');
    setSuccessMessage('');
  
    // Validar si se proporciona nombre de usuario y contraseña
    if (!username.trim()) {
      setUsernameError('Usuario requerido');
      return;
    }
    if (!password.trim()) {
      setPasswordError('Contraseña requerida');
      return;
    }
  
    try {
      const res: RequestResponse = await getFetcher<RequestResponse>('/user/0');
      const users: User[] = (res?.data as User[]) ?? [];
  
      // Buscar si el usuario y contraseña coinciden
      const usuario = users.find((usuario) => usuario.username === username);
  
      if (!usuario) {
        throw new Error('Nombre de usuario incorrecto');
      }
  
      const isPasswordValid = verifyPassword(password, usuario.password);
      if (!isPasswordValid) {
        throw new Error('Contraseña incorrecta');
      }
  
      setSuccessMessage('Usuario autenticado correctamente');
      setUser(usuario);
      localStorage.setItem('user', JSON.stringify({ id: usuario.id, username: usuario.username }));
      router.push('/principal');
  
    } catch (error: any) {
      console.error('Error during login:', error);
  
      if (error instanceof Error) {
        if (error.message === 'Nombre de usuario incorrecto') {
          setUsernameError(error.message);
        } else if (error.message === 'Contraseña incorrecta') {
          setPasswordError(error.message);
        } else if(error.message === 'Error fetching data'){
          setErrorMessage('Error interno del servidor');
        }
      } else {
        setErrorMessage('Error al autenticar usuario');
      }
    }
  };
  

  return (
    <>
      <form onSubmit={handleSubmit} style={{
        padding: '2rem',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '2rem',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 1)',
        minWidth: '300px'
      }} className='form'>
        <div>
          <h1 className='title' style={{userSelect: 'none'}}>Inicio de Sesión</h1>
        </div>
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className='input'
        />
        {usernameError && <p className='error'>{usernameError}</p>}
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='input'
          />
          <div
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              top: '50%',
              right: '0.5rem',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              color: showPassword ? '#000' : '#ccc',
              backgroundColor: 'white',
            }}
          >
            {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </div>
        </div>
        {passwordError && <p className='error'>{passwordError}</p>}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
          <button type="submit" className='button'>Iniciar Sesión</button>
          <NextLink href={`/register`} style={{
            color: 'white'
          }}>Registrarse</NextLink>
        </div>
      </form>
      {errorMessage && <p className='error'>{errorMessage}</p>} {/* Mostrar mensaje de error genérico */}
      {successMessage && <p className='success'>{successMessage}</p>}
    </>
  );
};

export default LoginForm;
