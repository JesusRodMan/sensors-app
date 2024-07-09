"use client"

import React, { useEffect, useState } from 'react';
import { useUser } from '@/app/login/providers/user.provider';
import { RequestResponse } from '@/interfaces/api';
import { getFetcher } from '@/services/api.service';
import { List, ListItem, ListItemText } from '@mui/material';
import { User } from '@prisma/client';
import CircularProgress from '@mui/material/CircularProgress';

interface Register {
    id: number;
    timestamp: string;
    data: number[];
    muscleId: string;
    nameArea: string;
    exercise: string;
}

interface RegistersListProps {
    customerId?: number;
    muscleId: string;
    muscleName: string;
    onRegisterSelect: (registerId: number) => void;
}

const RegistersList: React.FC<RegistersListProps> = ({ customerId, muscleId, muscleName, onRegisterSelect }) => {
    const { user } = useUser();
    const [registers, setRegisters] = useState<Register[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isRegister = (obj: any): obj is Register => {
        return (
            typeof obj.id === 'number' &&
            typeof obj.timestamp === 'string' &&
            Array.isArray(obj.data) &&
            obj.data.every((item: any) => item === null || typeof item === 'number') &&
            typeof obj.muscleId === 'string' &&
            typeof obj.nameArea === 'string' &&
            typeof obj.exercise === 'string'
        );
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                let response: RequestResponse;
                if (customerId) {
                    response = await getFetcher<RequestResponse>(`/validateUser/${customerId}`);
                } else {
                    response = await getFetcher<RequestResponse>(`/validateUser/${user?.id}`);
                }

                // Procesar la respuesta
                const usuario: User = response?.data as User;
                console.log(usuario.registers.length)
                if (usuario.registers && usuario.registers.length > 0) {
                    const filteredRegisters = (usuario.registers as any[])
                        .filter((register) => isRegister(register) && register.muscleId === muscleId)
                        .slice(-15)
                        .map((register) => register as Register)
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Ordena por timestamp descendente
                    setRegisters(filteredRegisters);
                }
            } catch (error) {
                console.error('Error al obtener los datos del usuario:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [user?.id, muscleId]);

    const handleRegisterClick = (registerId: number) => {
        onRegisterSelect(registerId);
    };

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <CircularProgress color="inherit" size={100} />
            </div>
        );
    }

    return (
        <>
            <div style={{ color: 'black', fontSize: '35px', textShadow: '0 0 10px rgba(255, 255, 255, 1)', fontWeight: 'bold', userSelect: 'none' }}>
                {muscleName}
            </div>
            {registers.length > 0 ? (
                <List style={{ gap: '5px' }}>
                    {registers.map((register) => (
                        <ListItem
                            key={register.id}
                            sx={{
                                color: 'white',
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                borderRadius: '8px',
                                marginBottom: '5px',
                                transition: 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 1)',
                                    boxShadow: '0 0 10px 2px rgba(255, 255, 255, 0.7)',
                                    transform: 'scale(1.015)',
                                },
                            }}
                            component="button"
                            onClick={() => handleRegisterClick(register.id)}
                        >
                            <ListItemText
                                primary={`Ejercicio: ${register.exercise}, Área: ${register.nameArea}`}
                                secondary={`Fecha: ${new Date(register.timestamp).toLocaleString()}`}
                                primaryTypographyProps={{ style: { color: 'white' } }}
                                secondaryTypographyProps={{ style: { color: 'rgba(255, 255, 255, 0.7)' } }}
                            />
                        </ListItem>
                    ))}
                </List>
            ) : (
                <div style={{
                    textAlign: 'center',
                    marginTop: '1vh',
                    fontSize: '30px',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: '8px',
                    marginBottom: '5px',
                    userSelect: 'none'
                }}>
                    Registros no encontrados
                </div>
            )}
        </>
    );
};

export default RegistersList;
