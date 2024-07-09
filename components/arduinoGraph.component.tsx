"use client";

import { useEffect, useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // Importa useNavigate para redireccionar
import io from 'socket.io-client';
import { TextField } from '@mui/material';
import { Button, Typography } from '@mui/material';
import { useUser } from '../app/login/providers/user.provider';
import { getFetcher, putFetcher } from '@/services/api.service';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { Area, Muscle, User } from '@prisma/client';
import { RequestResponse } from '@/interfaces/api';
import CircularProgress from '@mui/material/CircularProgress';
import MenuBar from '@/components/manuBar.component';
const socket = io('http://localhost:4000');

interface ArduinoGraphProps {
  idMuscle: Number;
  idArea: number;
}

const StyledTextField = styled(TextField)(({ error }) => ({
  '& .MuiInputBase-root': {
    color: 'white',
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255,255,255,0.6)',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: error ? 'red' : 'rgba(255,255,255,0.8)',
  },
  '& .MuiInput-underline.Mui-error:after': {
    borderBottomColor: 'red',
  },
}));

const ArduinoGraph: React.FC<ArduinoGraphProps> = ({ idMuscle, idArea }) => {
  const href = `/principal/muscle/${idMuscle}`;

  const [sensorDataArray, setSensorDataArray] = useState<number[]>([]);
  const [exercise, setExercise] = useState<string>('');
  const [exerciseInput, setExerciseInput] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maxDataPoints = 50; // Máximo de puntos que se muestran en la gráfica
  const testTimer = 10000;
  const { user } = useUser();
  const router = useRouter();
  const [customers, setCustomers] = useState<User[]>([]);
  const [customerSelect, setCustomerSelect] = useState<number | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [isTrainer, setIsTrainer] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [inputError, setInputError] = useState(false);

  const defaultValue = {
    id: 0,
    name: 'Error',
    image: "/img/errorMuscle.jpeg",
    muscleId: 'error',
    groupId: 0,
    areas: [] as Area[]
  };
  const [currentMuscleWithAreas, setCurrentMuscleWithAreas] = useState<Muscle & { areas: Area[] }>(defaultValue);


  useEffect(() => {
    const getUsersTrained = async () => {
      try {
        const res: RequestResponse = await getFetcher<RequestResponse>(`/validateTrainer/${user?.id}`);

        const { isTrainer, clients } = res?.data;
        if (isTrainer) {
          setIsTrainer(true);
          if (clients && clients.length > 0) {
            setCustomers(clients);
          }
        }
      } catch (error) {
        console.error('Error al mirar los clientes:', error);
      }
    };

    const fetchMuscleAreas = async () => {
      try {
        const res: RequestResponse = await getFetcher<RequestResponse>(`/muscleArea/${idMuscle}`);
        console.log('res?.data: ' + res?.data)
        setCurrentMuscleWithAreas(res?.data || defaultValue);
      } catch (error) {
        console.error('Error fetching filters:', error);
        setCurrentMuscleWithAreas(defaultValue);
      }
    }

    fetchMuscleAreas();
    getUsersTrained();
  }, []);

  const toggleTesting = () => {
    if (!isTesting) {
      console.log('Iniciar prueba');
      // Intentar conectar con el servidor
      try {
        // Iniciar la conexión con el servidor
        socket.connect();

        // Suscribirse a los eventos del socket
        socket.on('connect', () => {
          console.log('Conectado al servidor');
          // Cambiar el estado del botón
          setIsTesting(true);
        });

        socket.on('disconnect', () => {
          console.log('Conexión perdida con el servidor');
          // Cambiar el estado del botón
          setIsTesting(false);
        });

        socket.on('sensorData', (data) => {
          console.log('Received data:', data);
          setSensorDataArray((prevData) => {
            const newData = [...prevData, parseInt(data)];
            return newData;
          });
        });

        // Establecer un temporizador para finalizar la prueba después de 10 segundos
        setTimeout(() => {
          if (sensorDataArray.length > 0) {
            saveRegister();
          }
        }, testTimer);

      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        // Cambiar el estado del botón
        setIsTesting(false);
      }
    } else {
      socket.disconnect();
      setIsTesting(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (ctx && canvas !== null) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Definir los valores mínimo y máximo
      const minValue = 0;
      const maxValue = 1200;

      // Calcular los límites de la escala con un margen adicional
      const scaleMargin = 50; // Margen adicional para la escala
      const scaleMin = Math.max(minValue - 200, minValue - scaleMargin);
      const scaleMax = Math.min(maxValue + 200, maxValue + scaleMargin);

      // Dibujar el fondo oscuro
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Negro con transparencia
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar guía mínima
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      const minYPos = canvas.height - ((minValue - scaleMin) / (scaleMax - scaleMin)) * canvas.height;
      ctx.moveTo(0, minYPos);
      ctx.lineTo(canvas.width, minYPos);
      ctx.stroke();

      // Dibujar guía máxima
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      const maxYPos = canvas.height - ((maxValue - scaleMin) / (scaleMax - scaleMin)) * canvas.height;
      ctx.moveTo(0, maxYPos);
      ctx.lineTo(canvas.width, maxYPos);
      ctx.stroke();

      // Dibujar valores de referencia
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.textAlign = 'start'; // Alinea el texto a la izquierda
      ctx.textBaseline = 'middle';
      ctx.font = '20px Arial';

      for (let value = maxValue; value >= minValue; value -= scaleMargin) {
        if (value === minValue - scaleMargin || value === maxValue + scaleMargin) continue; // Saltar los valores extremos
        const y = canvas.height - ((value - scaleMin) / (scaleMax - scaleMin)) * canvas.height;
        const yOffset = 9; // Ajuste vertical para centrar los valores
        ctx.fillText(value.toString(), 5, y - yOffset); // Cambia la posición x a 5 para alinear a la izquierda

        // Dibujar línea de referencia
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Dibujar la gráfica
      ctx.beginPath();
      ctx.strokeStyle = 'rgb(75, 192, 192)';
      ctx.lineWidth = 2;

      const startIndex = Math.max(sensorDataArray.length - maxDataPoints, 0); // Índice de inicio para dibujar los últimos maxDataPoints valores

      for (let i = startIndex; i < sensorDataArray.length; i++) {
        const x = ((i - startIndex) / (maxDataPoints - 1)) * canvas.width; // Distribuir los puntos uniformemente en la anchura del canvas
        const y = canvas.height - ((sensorDataArray[i] - scaleMin) / (scaleMax - scaleMin)) * canvas.height;
        if (i === startIndex) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        // Mostrar el valor sobre el final de la línea azul
        if (i === sensorDataArray.length - 1) {
          ctx.fillStyle = 'white';
          const maxTextX = canvas.width - ctx.measureText(sensorDataArray[i].toString()).width - 5;
          const textX = Math.min(maxTextX, x);
          ctx.fillText(sensorDataArray[i].toString(), textX, y - 10);
        }
      }

      ctx.stroke();
    }
  }, [sensorDataArray]);

  // Usar un intervalo para actualizar la gráfica cada segundo
  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     setSensorDataArray((prevData) => {
  //       if (prevData.length > 0) {
  //         return [...prevData];
  //       }
  //       return prevData;
  //     });
  //   }, 500); // Actualizar cada segundo

  //   return () => clearInterval(intervalId);
  // }, []);


  const handleConfirmClick = () => {
    if (exerciseInput.trim() === '') {
      setInputError(true);
    } else {
      setExercise(exerciseInput);
      setInputError(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExerciseInput(e.target.value);
    if (e.target.value.trim() !== '') {
      setInputError(false);
    } else {
      setInputError(true);
    }
  };


  const saveRegister = async () => {
    setIsTesting(false);
    setIsSaving(true);

    console.log('customerSelect:' + customerSelect)
    console.log('sensorDataArray:' + sensorDataArray);

    // Filtra los valores null del array
    const filteredSensorDataArray = sensorDataArray?.filter(item => item !== null) || [];
    console.log('filteredSensorDataArray:' + filteredSensorDataArray);

    socket.disconnect();
    console.log('Finalizar prueba');
    const area = currentMuscleWithAreas.areas.find(area => area.id === Number(idArea));
    try {
      await putFetcher('/user/0', {
        userId: selectedCustomer ?? user?.id,
        newData: filteredSensorDataArray || [],
        muscleId: currentMuscleWithAreas.muscleId,
        nameArea: area?.name || 'undefined',
        exercise: exercise,
      });
      console.log('Datos guardados exitosamente');
      router.push(`/principal/resumeTest/${customerSelect ?? user?.id}`);
    } catch (error) {
      console.error('Error al guardar los datos:', error);
    }
  };

  return (
    <>
      {isSaving ? (
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
      ) : (
        <>
          <MenuBar href={href} />
          <div style={{ display: 'flex', minHeight: '90vh', width: '100%' }}>
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <h1
                style={{
                  fontSize: '30px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  borderRadius: '5px',
                  textShadow: '0 0 10px rgba(255, 255, 255, 1)',
                  marginBottom: '5px',
                }}
              >
                Gráfico de Pruebas
              </h1>
              <canvas ref={canvasRef} width={1000} height={770}></canvas>
              <div style={{ display: 'flex', marginTop: '20px', gap: '10px' }}>
                {!exercise && (
                  <>
                    <StyledTextField
                      label="Ejercicio"
                      variant="standard"
                      value={exerciseInput}
                      onChange={handleInputChange}
                      style={{
                        marginBottom: '20px',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                      }}
                      error={inputError}
                    />
                    <Button
                      onClick={handleConfirmClick}
                      style={{
                        borderRadius: '20px',
                        padding: '10px 20px',
                        backgroundColor: !inputError ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)',
                        color: 'white',
                        border: 'none',
                        cursor: !inputError ? 'pointer' : 'not-allowed',
                        outline: 'none',
                        marginBottom: '20px',
                      }}
                    >
                      Confirmar
                    </Button>
                  </>
                )}
                {exercise && (
                  <>
                    {isTrainer && !selectedCustomer && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {customers.length > 0 ? (
                          <>
                            <select
                              value={customerSelect || ''}
                              onChange={(e) => setCustomerSelect(e.target.value ? parseInt(e.target.value) : null)}
                              className='input'
                              style={{ padding: '10px', fontSize: '16px', width: '200px' }}
                            >
                              <option value="">Seleccione un cliente</option>
                              {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>
                                  {customer.username}
                                </option>
                              ))}
                            </select>
                            {customerSelect && !selectedCustomer && (
                              <Button
                                onClick={() => setSelectedCustomer(customerSelect)}
                                style={{
                                  borderRadius: '20px',
                                  padding: '10px 20px',
                                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                  color: 'white',
                                  border: 'none',
                                  outline: 'none',
                                }}
                              >
                                Continuar
                              </Button>
                            )}
                          </>
                        ) : (
                          <Typography variant="body1" sx={{ textShadow: '0 0 10px rgba(255, 255, 255, 1)', fontWeight: 'bold', userSelect: 'none' }}>
                            No puede realizar la prueba ya que no tiene clientes
                          </Typography>
                        )}
                      </div>
                    )}
                    {(isTrainer ? selectedCustomer : true) && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {sensorDataArray.length === 0 && (
                          <Button
                            onClick={toggleTesting}
                            style={{
                              borderRadius: '20px',
                              padding: '10px 20px',
                              backgroundColor: 'rgba(0, 0, 0, 0.7)',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              outline: 'none',
                            }}
                          >
                            Iniciar Prueba
                          </Button>
                        )}
                        {sensorDataArray.length > 0 && (
                          <Button
                            onClick={saveRegister}
                            style={{
                              borderRadius: '20px',
                              padding: '10px 20px',
                              backgroundColor: 'rgba(51, 145, 59, 0.7)',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              textDecoration: 'none',
                              display: 'inline-block',
                              textAlign: 'center',
                              outline: 'none',
                            }}
                          >
                            Finalizar Prueba
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ArduinoGraph;