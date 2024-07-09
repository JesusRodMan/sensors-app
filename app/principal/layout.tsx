"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Background from '@/components/background.component';
import CircularProgress from '@mui/material/CircularProgress';
import { useUser } from '../login/providers/user.provider';
import { RequestResponse } from '@/interfaces/api';
import { User } from '@prisma/client';
import { getFetcher } from '@/services/api.service';

export default function PrincipalLayout({ children }: { children: React.ReactNode }) {
  const [isValidating, setIsValidating] = useState(true);
  const { setUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    const validateUser = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const storedUserData = JSON.parse(storedUser);
        const { id, username } = storedUserData;

        try {
          const res: RequestResponse = await getFetcher<RequestResponse>(`/validateUser/${id}`);
          const user: User = res?.data as User;

          // Verificar si el usuario y la contraseña coinciden
          if (user && user.username === username) {
            setUser(storedUserData);
            setIsValidating(false);
          } else {
            localStorage.removeItem('user');
            router.push('/login');
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          localStorage.removeItem('user');
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    };

    validateUser();
  }, [setUser, router]);

  if (isValidating) {
    return (
      <>
        <Background />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          width: '100%',
        }}>
          <div style={{
            display: 'flex',
            gap: '10px',
            width: '100%',
            maxWidth: '600px',
            padding: '1rem',
            boxSizing: 'border-box',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <CircularProgress color="inherit" size={100} />
          </div>
        </div>
      </>
    );
  }

  return (
    <div>
      {children}
    </div>
  );
}
