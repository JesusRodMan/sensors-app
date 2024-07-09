"use client"

import { useEffect, useState } from 'react';
import { postFetcher, getFetcher } from "@/services/api.service";
import { RequestResponse } from '@/interfaces/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import NextLink from "next/link";
import '@/app/register/register.css';
import { useRouter } from 'next/navigation';
import { useUser } from '../app/login/providers/user.provider';
import { User } from '@prisma/client';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [entrenadores, setEntrenadores] = useState<User[]>([]);
  const [selectedEntrenador, setSelectedEntrenador] = useState<number | null>(null);
  const router = useRouter();
  const { setUser } = useUser();

  useEffect(() => {
    localStorage.removeItem('user');
    setUser(null);

    // Obtener la lista de entrenadores
    const fetchEntrenadores = async () => {
      try {
        const res: RequestResponse = await getFetcher<RequestResponse>('/user/2');
        const entrenadores: User[] = (res?.data as User[]) ?? null;
        console.log(entrenadores)
        if (entrenadores) {
          setEntrenadores(entrenadores);
        } else {
          throw new Error(res?.message || 'Error al obtener entrenadores');
        }
      } catch (error) {
        console.error('Error fetching entrenadores:', error);
      }
    };

    fetchEntrenadores();
  }, [setUser]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUsernameError('');
    setPasswordError('');
    setErrorMessage('');
    setSuccessMessage('');

    if (!username.trim()) {
      setUsernameError('Usuario requerido');
      return;
    }
    if (!password.trim()) {
      setPasswordError('Contraseña requerida');
      return;
    } else if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const body = {
      username,
      password,
      userRoles: [{ roleId: 1 }],
      entrenadorId: selectedEntrenador,
    };

    try {
      const res: RequestResponse = await postFetcher<RequestResponse>(
        `/user/0`,
        body
      );

      if (!res || res.status >= 400) {
        throw new Error(res?.message || 'Error al registrar usuario');
      }
      const user: User = res.data;
      setSuccessMessage(res.message || 'Usuario registrado correctamente');
      setUser(user);
      localStorage.setItem('user', JSON.stringify({ id: user.id, username: user.username }));
      router.push('/principal');
    } catch (error: any) {
      if (error.message.includes('El nombre de usuario ya existe')) {
        setUsernameError('El nombre de usuario ya existe');
      } else {
        setErrorMessage('Error al registrar usuario');
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
          <h1 className='title' style={{ userSelect: 'none' }}>Registro</h1>
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
        <select
          value={selectedEntrenador || ''}
          onChange={(e) => setSelectedEntrenador(e.target.value ? parseInt(e.target.value) : null)}
          className='input'
        >
          <option value="">Seleccione un entrenador (opcional)</option>
          {entrenadores.map(entrenador => (
            <option key={entrenador.id} value={entrenador.id}>
              {entrenador.username}
            </option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
          <button type="submit" className='button'>Registrarse</button>
          <NextLink href={`/login`} style={{
            color: 'white'
          }}>Iniciar Sesión</NextLink>
        </div>
      </form>
      {errorMessage && <p className='error'>{errorMessage}</p>} {/* Mostrar mensaje de error genérico */}
      {successMessage && <p className='success'>{successMessage}</p>}
    </>
  );
}

export default RegisterForm;
