"use client";

import React, { useState, useEffect } from 'react';
import { Box, Button, Checkbox, Drawer, List, ListItem, ListItemButton, ListItemIcon, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import CardComponent from '@/../../components/card.component';
import Background from '@/../../components/background.component';
import NextLink from 'next/link';
import { useUser } from '../../app/login/providers/user.provider';
import { getFetcher } from '@/services/api.service';
import { RequestResponse } from '@/interfaces/api';
import { Group, Muscle } from '@prisma/client';
import './principal.css'

const TemporaryDrawer = () => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<number[]>([]);
  const [icon, setIcon] = useState(<MenuIcon />);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const [muscles, setMuscles] = useState<Muscle[]>([]);
  const [filters, setFilters] = useState<Group[]>([]);

  useEffect(() => {
    const fetchMuscles = async () => {
      try {
        const res: RequestResponse = await getFetcher<RequestResponse>('/muscle');
        const musclesRes: Muscle[] = (res?.data as Muscle[]) ?? [];
        setMuscles(musclesRes);
      } catch (error) {
        console.error('Error fetching muscles:', error);
      }
    };

    const fetchFilters = async () => {
      try {
        const res: RequestResponse = await getFetcher<RequestResponse>('/group');
        const filtersRes: Group[] = (res?.data as Group[]) ?? [];
        setFilters(filtersRes);
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };

    fetchMuscles();
    fetchFilters();
  }, []);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
    setIcon(newOpen ? <CloseIcon /> : <MenuIcon />);
  };

  // Función para manejar el cambio de los filtros
  const handleFilterChange = (value: number) => {
    if (selectedFilters.includes(value)) {
      setSelectedFilters(selectedFilters.filter((filter) => filter !== value));
    } else {
      setSelectedFilters([...selectedFilters, value]);
    }
  };

  // Función para manejar el clic en los items de la lista
  const handleListItemClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, value: number) => {
    event.stopPropagation();
    handleFilterChange(value);
  };

  // Función para manejar el cambio de la búsqueda
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const removeAccents = (text: string) => {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };

  const filteredCards = muscles.filter((muscle) => {
    const searchTermMatch = removeAccents(muscle.name.toLowerCase()).startsWith(removeAccents(searchTerm.toLowerCase()));
    const filterMatch = selectedFilters.length === 0 || selectedFilters.includes(muscle.groupId);
    return searchTermMatch && filterMatch;
  });

  const handleCardHover = (index: number) => {
    setHoveredCardIndex(index);
  };

  const DrawerList = (
    <Box role="presentation">
      <List>
        {filters.map((filter) => (
          <ListItem key={filter.id} disablePadding>
            <ListItemButton onClick={(event) => handleListItemClick(event, filter.id)}>
              <ListItemIcon>
                <Checkbox
                  checked={selectedFilters.includes(filter.id)}
                  onChange={() => handleFilterChange(filter.id)}
                />
              </ListItemIcon>
              <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 25, fontFamily: 'monospace' }}>
                {filter.name}
              </Typography>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <Background />

      <div
        style={{
          top: '0',
          left: '0',
          width: '100%',
          minWidth: '350px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 2,
          position: 'fixed',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          borderRadius: '9px',
          boxShadow: '0px 3px 10px rgba(255, 255, 255, 0.4)',
          paddingLeft: '1vw',
          paddingRight: '1vw',
        }}
      >
        {/* Botón a la izquierda */}
        <Button
          sx={{
            zIndex: 1300,
            borderRadius: '9px',
            padding: '8px',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              '& .MuiSvgIcon-root': {
                color: 'white',
              },
            },
            '& .MuiSvgIcon-root': {
              fontSize: '2.5rem',
              color: 'black',
            },
            '&:focus': {
              outline: 'none',
            },
          }}
          onClick={toggleDrawer(!open)}
        >
          {icon}
        </Button>

        {/* Buscador centrado */}
        <div style={{ textAlign: 'center', flex: 1 }}>
          <input
            type="text"
            placeholder="Buscar músculo..."
            style={{
              fontSize: 'clamp(1rem, 1vw + 0.6rem, 1.7rem)',
              padding: '8px',
              borderRadius: '15px',
              border: '1px solid #ccc',
              width: '50vw',
              maxWidth: '80%',
              minWidth: '90%',
              height: '2.5rem',
              margin: '0 auto',
            }}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Contenedor para el nombre de usuario y botón de cierre de sesión a la derecha */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            // marginRight: '20px',
          }}
        >

          <NextLink href="/principal/account" passHref>
            <Typography
              variant="body1"
              sx={{
                padding: '5px',
                borderRadius: '5px',
                fontWeight: 'bold',
                fontSize: 'clamp(1.3rem, 1vw + 0.6rem, 1.7rem)',
                userSelect: 'none',
                transition: 'background-color 0.3s ease, color 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  color: 'white',
                },
                '&:focus': {
                  outline: 'none',
                },
              }}
            >
              {user?.username || 'null'}
            </Typography>
          </NextLink>

          <NextLink href="/login" passHref>
            <Button
              sx={{
                borderRadius: '15px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                  },
                },
                '& .MuiSvgIcon-root': {
                  fontSize: '2rem',
                  color: 'black',
                },
                '&:focus': {
                  outline: 'none',
                },
              }}
            >
              <LogoutIcon />
            </Button>
          </NextLink>
        </div>
      </div>

      <Drawer
        open={open}
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            minWidth: '200px',
            width: '11%',
            zIndex: 1,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          {DrawerList}
        </Box>
      </Drawer>

      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          width: '100%',
          minWidth: '350px',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 0,
        }}
      >
        <div
          style={{
            width: '90%',
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingBottom: '3rem',
          }}
        >
          {filteredCards.map((muscle, index) => {
            const href = `/principal/muscle/${muscle.id}`;

            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  minWidth: '20%',
                  zIndex: hoveredCardIndex === index ? muscles.length : muscles.length - index,
                }}
                key={index}
                onMouseEnter={() => handleCardHover(index)}
                onMouseLeave={() => setHoveredCardIndex(null)}
              >
                <CardComponent image={muscle.image} text={muscle.name} href={href} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default TemporaryDrawer;
