"use client"

import { useUser } from '@/app/login/providers/user.provider';
import { RequestResponse } from '@/interfaces/api';
import { getFetcher } from '@/services/api.service';
import { User } from '@prisma/client';
import { useState, useEffect } from 'react';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';
import CircularProgress from '@mui/material/CircularProgress';
import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const normalizeData = (data: number[]): { name: string; value: number }[] => {
    return data.map((value, index) => ({
        name: `${index + 1}`,
        value: value,
    }));
};

interface ResumeGraphProps {
    userId?: number;
    registerId?: number;
    onBackToList?: () => void;
}

const ResumeGraph: React.FC<ResumeGraphProps> = ({ userId, registerId, onBackToList }) => {
    const { user } = useUser();
    const [loading, setLoading] = useState<boolean>(true); // Estado de carga
    const [sensorDataArray, setSensorDataArray] = useState<number[]>([]);
    const [muscleId, setMuscleId] = useState<string>('');
    const [nameArea, setNameArea] = useState<string>('');
    const [exercise, setExercise] = useState<string>('');
    const [usuario, setUsuario] = useState<User>();

    console.log('userId:' + userId)
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                let response: RequestResponse;

                if (userId) {
                    response = await getFetcher<RequestResponse>(`/validateUser/${userId}`);
                } else {
                    response = await getFetcher<RequestResponse>(`/validateUser/${user?.id}`);
                }
                // Procesar la respuesta
                const usuario: User = response?.data as User;
                setUsuario(usuario);
                let specificCollection;

                if (usuario.registers && usuario.registers.length > 0) {
                    console.log(registerId)
                    if (registerId) {
                        specificCollection = usuario.registers[registerId - 1] as { timestamp: string, data: number[], muscleId: string, nameArea: string, exercise: string };
                    } else {
                        const lastCollectionIndex = usuario.registers.length - 1;
                        specificCollection = usuario.registers[lastCollectionIndex] as { timestamp: string, data: number[], muscleId: string, nameArea: string, exercise: string };
                    }
                    console.log(specificCollection)
                    if (specificCollection) {
                        setMuscleId(specificCollection.muscleId);
                        setNameArea(specificCollection.nameArea);
                        setExercise(specificCollection.exercise);
                        setSensorDataArray(specificCollection.data);
                        setLoading(false); // Cambiar estado a false cuando se cargan los datos
                    } else {
                        throw new Error(`Error al establecer los valores del registro`);
                    }
                } else {
                    throw new Error(`Registros no encontrados para ${usuario.username}`);
                }
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user?.id, registerId]);

    // const handleBackToList = () => {
    //     if (onBackToList)
    //         onBackToList();
    // };

    const normalizedData = normalizeData(sensorDataArray);
    const maxValue = Math.max(...sensorDataArray);
    const minValue = Math.min(...sensorDataArray);
    const avgValue = sensorDataArray.reduce((acc, value) => acc + value, 0) / sensorDataArray.length;
    const yAxisMax = maxValue + 30;
    const yAxisMin = minValue - 30;

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <CircularProgress color="inherit" size={100} />
            </div>
        );
    }

    return (
        <>
            {/* <Button onClick={handleBackToList} variant="contained" style={{ margin: '20px' }}>
                Volver a la lista de registros
            </Button> */}
            {registerId && (
                <IconButton color="inherit" onClick={onBackToList} sx={{
                    zIndex: 1300,
                    borderRadius: '9px',
                    padding: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    transition: 'background-color 0.3s ease, color 0.3s ease',
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                        '& .MuiSvgIcon-root': {
                            color: 'white',
                        },
                    },
                    '& .MuiSvgIcon-root': {
                        transition: 'color 0.3s ease',
                        color: 'black',
                        fontSize: '2rem',
                    },
                    '&:focus': {
                        outline: 'none',
                    },
                }}>
                    {<ArrowBackIcon />}
                </IconButton>
            )}
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '90%',
                        borderRadius: '20px',
                        gap: '5px',
                        alignItems: 'center',
                    }}>
                    <h1 style={{
                        fontSize: '40px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        borderRadius: '5px',
                        textShadow: '0 0 10px rgba(255, 255, 255, 1)',
                    }}>Resumen de las Estadísticas</h1>
                    <ResponsiveContainer height={600}>
                        <LineChart
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', }}
                            data={normalizedData}
                            margin={{ top: 5, right: 55, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="2" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[yAxisMin, yAxisMax]} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', width: '80%', alignItems: 'center', gap: '5px' }}>
                    <h1 style={{
                        fontSize: '40px',
                        color: 'white',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        borderRadius: '5px',
                        textShadow: '0 0 20px rgba(0, 0, 0, 1)', // Efecto de brillo alrededor del texto
                    }}>Detalles de la Prueba</h1>
                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'rgba(255, 255, 255, 0.5)', boxShadow: '0 0 10px rgba(255, 255, 255, 1)', }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Usuario</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Músculo</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Área</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Ejercicio</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Valor Máximo</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Valor Mínimo</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Valor Medio</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ textAlign: 'center' }}>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{usuario?.username}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{muscleId}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{nameArea}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{exercise}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{maxValue}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{minValue}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{avgValue.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default ResumeGraph;
