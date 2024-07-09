"use client";

import React, { useEffect, useState } from 'react';
import Background from '@/components/background.component';
import Image from 'next/image';
import CardComponent from '@/components/card.component';
import '../../principal.css';
import MenuBar from '@/components/manuBar.component';
import './muscle.css';
import NextLink from 'next/link';
import CircularProgress from '@mui/material/CircularProgress';
import { RequestResponse } from '@/interfaces/api';
import { getFetcher } from '@/services/api.service';
import { Area, Muscle } from '@prisma/client';

interface Props {
  params: { id: Number };
}

const MusclePage: React.FC<Props> = ({ params: { id } }) => {
  const defaultValue = {
    id: 0,
    name: 'Error',
    image: "/img/errorMuscle.jpeg",
    muscleId: 'error',
    groupId: 0,
    areas: [] as Area[]
  };

  const [currentMuscleWithAreas, setCurrentMuscleWithAreas] = useState<Muscle & { areas: Area[] }>(defaultValue);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);

  useEffect(() => {
    const fetchMuscleAreas = async () => {
      setIsLoading(true);
      console.log(id)
      try {
        const res: RequestResponse = await getFetcher<RequestResponse>(`/muscleArea/${id}`);
        console.log('res?.data: ' + res?.data)
        setCurrentMuscleWithAreas(res?.data || defaultValue);
      } catch (error) {
        console.error('Error fetching filters:', error);
        setCurrentMuscleWithAreas(defaultValue);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMuscleAreas();
  }, []);

  const handleCardClick = (area: Area) => {
    setSelectedArea(area);
  };

  const handleCloseModal = () => {
    setSelectedArea(null);
  };

  const handleButtonClick = () => {
    setIsLoading(true);
  };

  return (
    <>
      <Background />
      {isLoading ? (
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
          <MenuBar href="/principal" />
          {currentMuscleWithAreas.name !== defaultValue.name ? (
            <>
              <div className='container'>
                <h1 className='title'>Seleccione la parte del {currentMuscleWithAreas.name} que desea trabajar:</h1>
                <div className='cardContainer'>
                  {currentMuscleWithAreas.areas.map((area, index) => (
                    <div key={index} className='card' onClick={() => handleCardClick(area)}>
                      <CardComponent image={area.image} text={area.name} href="#" />
                    </div>
                  ))}
                </div>
              </div>

              {selectedArea && (
                <div className={`modal`} onClick={handleCloseModal}>
                  <div className='modalContent' onClick={(e) => e.stopPropagation()}>
                    <p style={{ color: 'black', fontWeight: 'bold', userSelect: 'none', fontSize: '1.2rem' }}>Los puntos dibujados hacen referencia a una posición aproximada de los cables con sus respetivos colores</p>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px', marginTop: '10px', pointerEvents: 'none', userSelect: 'none' }}>
                      <Image src={selectedArea.image} alt="Selected Muscle" layout="responsive" width={400} height={400} />
                    </div>
                    <p style={{ color: 'black', userSelect: 'none' }}>
                      <span style={{ fontWeight: 'bold', color: 'black' }}>Referencia [REF] Negro:</span>
                      <span style={{ color: 'rgb(46, 46, 46)' }}> Conéctelo a una sección separada del cuerpo, o una porción ósea como puede ser el codo.</span>
                    </p>
                    <p style={{ userSelect: 'none' }}>
                      <span style={{ fontWeight: 'bold', color: 'rgb(0, 78, 179)' }}>Fin [FIN] Azul:</span>
                      <span style={{ color: 'rgb(46, 46, 46)' }}> Conéctelo al final del grupo de músculos.</span>
                    </p>
                    <p style={{ userSelect: 'none' }}>
                      <span style={{ fontWeight: 'bold', color: 'rgb(226, 19, 43)' }}>Medio [MEDIO] Rojo:</span>
                      <span style={{ color: 'rgb(46, 46, 46)' }}> Conéctelo a la mitad del grupo de músculos.</span>
                    </p>
                    <br />
                    <p style={{ userSelect: 'none' }}>
                      <span style={{ color: 'black' }}>(En el caso de no tener los cables, colocar el sensor en una zona intermedia de los puntos</span>
                      <span style={{ fontWeight: 'bold', color: 'rgb(226, 19, 43)' }}> [MEDIO] </span>
                      <span style={{ color: 'black' }}>y</span>
                      <span style={{ fontWeight: 'bold', color: 'rgb(0, 78, 179)' }}> [FIN]</span>
                      <span style={{ color: 'black' }}>)</span>
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
                      <NextLink href={`/principal/muscle/${currentMuscleWithAreas.id}/statsRealTime/${selectedArea.id}`} passHref>
                        <button className='testButtonTest' onClick={handleButtonClick} disabled={isLoading}>
                          Prueba
                        </button>
                      </NextLink>
                      <button className='testButtonClose' onClick={handleCloseModal} disabled={isLoading}>Cerrar</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className='errorBackground'>
              <Image src={currentMuscleWithAreas.image} layout="fill" objectFit="cover" alt="Background Image" priority />
            </div>
          )}
        </>
      )}
    </>
  );
};

export default MusclePage;
