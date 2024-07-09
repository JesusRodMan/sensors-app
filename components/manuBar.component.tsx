
"use client";

import { Button, Typography, AppBar, Toolbar, IconButton, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import NextLink from 'next/link';
// import '../components/principal/principal.css'
import { useUser } from '@/app/login/providers/user.provider';
import { useEffect, useState } from 'react';

interface Props {
    href: string;
}

const MenuBar: React.FC<Props> = ({ href }) => {
    const { user } = useUser();
    const [icon, setIcon] = useState(<HomeIcon />);

    useEffect(() => {
        setIcon(href == "/principal" ? <HomeIcon /> : <ArrowBackIcon />);
    }, [href]);

    return (
        <div style={{paddingBottom: '10px',}}>
            <AppBar position="relative" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', boxShadow: '0px 3px 10px rgba(255, 255, 255, 0.4)' }}>
                <Toolbar style={{ justifyContent: 'space-between', padding: '0 1vw' }}>
                    <div>
                        <NextLink href={href} passHref>
                            <IconButton color="inherit" sx={{
                                zIndex: 1300,
                                borderRadius: '9px',
                                padding: '8px',
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
                                {icon}
                            </IconButton>
                        </NextLink>
                    </div>

                    {/* Contenedor para el nombre de usuario y botón de cierre de sesión a la derecha */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
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
                                    color: 'black',
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
                                        transition: 'color 0.3s ease',
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
                </Toolbar>
            </AppBar>
        </div>
    )
}

export default MenuBar;