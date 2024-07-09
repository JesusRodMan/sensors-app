"use client"

import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useUser } from '@/app/login/providers/user.provider';
import Background from '@/components/background.component';
import { RequestResponse } from '@/interfaces/api';
import { useEffect, useState } from 'react';
import { Group, Muscle, User } from '@prisma/client';
import { getFetcher } from '@/services/api.service';
import RegistersList from '@/components/registersList.component';
import NextLink from 'next/link';
import HomeIcon from '@mui/icons-material/Home';
import CircularProgress from '@mui/material/CircularProgress';
import ResumeGraph from '@/components/resumeGraph.component';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
    open?: boolean;
}>(({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    }),
}));

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    backgroundColor: 'rgb(0,0,0, 0.9)',
    boxShadow: '0px 0px 10px rgba(0,0,0, 1)',
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

export default function Account() {
    const { user } = useUser();
    const theme = useTheme();
    const [open, setOpen] = React.useState(window.innerWidth >= 600);
    const [muscles, setMuscles] = useState<Muscle[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [customers, setCustomers] = useState<User[]>([]);
    const [selectedMuscle, setSelectedMuscle] = useState<Muscle>();
    const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
    const [activeComponent, setActiveComponent] = useState<'registers' | 'details' | 'users' | 'muscles' | null>(null);
    const [selectedRegister, setSelectedRegister] = useState<number | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isTrainer, setIsTrainer] = useState<boolean>(false);
    const [isUsers, setIsUsers] = useState<boolean>(true);

    const getUsersTrained = async () => {
        try {
            const res: RequestResponse = await getFetcher<RequestResponse>(`/validateTrainer/${user?.id}`);
            const { isTrainer, clients } = res?.data;
            console.log('isTrainer: ' + isTrainer)
            if (isTrainer) {
                setIsTrainer(true);
                if (clients && clients.length > 0) {
                    setCustomers(clients);
                    setActiveComponent('users');
                } else {
                    await fetchMusclesAndGroups();
                }
            } else {
                await fetchMusclesAndGroups();
            }
        } catch (error) {
            console.error('Error al mirar los clientes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMusclesAndGroups = async () => {
        try {
            const [musclesRes, groupsRes] = await Promise.all([
                getFetcher<RequestResponse>('/muscle'),
                getFetcher<RequestResponse>('/group'),
            ]);

            const musclesData: Muscle[] = musclesRes?.data ?? [];
            const groupsData: Group[] = groupsRes?.data ?? [];

            setMuscles(musclesData);
            setGroups(groupsData);
            setActiveComponent('muscles');
        } catch (error) {
            console.error('Error fetching muscles and groups:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getUsersTrained();

        const handleResize = () => {
            if (window.innerWidth < 600) {
                setOpen(false);
            } else {
                setOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const handleMuscleSelection = (muscle: Muscle) => {
        setSelectedMuscle(muscle);
        setActiveComponent('registers');
    };

    const handleCustomerSelection = async (customer: User) => {
        setSelectedCustomer(customer);
        setIsUsers(false);
        setActiveComponent('muscles');
        if (muscles.length === 0) {
            await fetchMusclesAndGroups();
        }
    };


    const handleRegisterSelection = (registerId: number) => {
        console.log('registerId: ' + registerId)
        setSelectedRegister(registerId);
        setActiveComponent('details');
    };

    const handleBackToList = () => {
        setSelectedRegister(undefined);
        setActiveComponent('registers');
    };

    const handleUsersList = () => {
        setIsUsers(true);
        setSelectedCustomer(null);
        setActiveComponent('users');
    };

    const renderMainContent = () => {
        switch (activeComponent) {
            case 'registers':
                return (
                    <RegistersList
                        customerId={selectedCustomer?.id}
                        muscleId={selectedMuscle?.muscleId ?? ''}
                        muscleName={selectedMuscle?.name ?? ''}
                        onRegisterSelect={handleRegisterSelection}
                    />
                );
            case 'details':
                return (
                    <ResumeGraph userId={selectedCustomer?.id} registerId={selectedRegister} onBackToList={handleBackToList} />
                );
            case 'users':
                return (
                    <div style={{ color: 'black', textAlign: 'center', fontSize: '30px', textShadow: '0 0 10px rgba(255, 255, 255, 1)', fontWeight: 'bold', userSelect: 'none' }}>
                        Seleccione un usuario para ver sus registros
                    </div>
                );
            case 'muscles':
                return (
                    <div style={{ color: 'black', textAlign: 'center', fontSize: '30px', textShadow: '0 0 10px rgba(255, 255, 255, 1)', fontWeight: 'bold', userSelect: 'none' }}>
                        Seleccione un músculo para ver sus registros
                    </div>
                );
            default:
                return (
                    <div style={{ textAlign: 'center', paddingTop: '5vh' }}>
                        <CircularProgress color="inherit" size={50} />
                    </div>
                );
        }
    };

    return (
        <>
            <Background />
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar position="fixed" open={open}>
                    <Toolbar style={{
                        background: 'transparent',
                        color: 'inherit'
                    }}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={handleDrawerOpen}
                            edge="start"
                            sx={{ mr: 2, ...(open && { display: 'none' }) }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <div>
                            <NextLink href={'/principal'} passHref>
                                <IconButton color="inherit" sx={{
                                    zIndex: 1300,
                                    borderRadius: '9px',
                                    marginRight: '10px',
                                    // padding: '8px',
                                    transition: 'background-color 0.3s ease, color 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        '& .MuiSvgIcon-root': {
                                            color: 'rgba(255, 255, 255, 0.7)',
                                        },
                                    },
                                    '& .MuiSvgIcon-root': {
                                        transition: 'color 0.3s ease',
                                        color: 'white',
                                        fontSize: '2rem',
                                    },
                                    '&:focus': {
                                        outline: 'none',
                                    },
                                }}>
                                    {<HomeIcon />}
                                </IconButton>
                            </NextLink>
                        </div>
                        <Typography variant="h6" noWrap component="div" sx={{ userSelect: 'none', }}>
                            Tus registros, {user?.username}
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            background: 'transparent',
                            backgroundColor: 'rgb(255,255,255, 0.5)',
                            boxShadow: '0px 0px 10px rgba(255,255,255, 1)',
                        },
                    }}
                    variant="persistent"
                    anchor="left"
                    open={open}
                >
                    <DrawerHeader>
                        <IconButton onClick={handleDrawerClose}>
                            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                        </IconButton>
                    </DrawerHeader>
                    {isLoading ? ( // Mostrar mensaje de carga mientras se cargan los datos
                        <div style={{ textAlign: 'center', paddingTop: '5vh' }}>
                            <CircularProgress color="inherit" size={50} />
                        </div>
                    ) : (
                        (isTrainer && isUsers && !selectedCustomer) ? (
                            <div>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', paddingLeft: '2%', userSelect: 'none' }}>
                                    Clientes
                                </Typography>
                                <Divider />
                                <List>
                                    {customers.length > 0 ? (
                                        customers.map((customer) => (
                                            <ListItem key={customer.id} disablePadding>
                                                <ListItemButton onClick={() => handleCustomerSelection(customer)}>
                                                    <ListItemIcon>
                                                        <PersonIcon />
                                                    </ListItemIcon>
                                                    <ListItemText primary={customer.username} />
                                                </ListItemButton>
                                            </ListItem>
                                        ))
                                    ) : (
                                        <Typography variant="body1" sx={{ paddingLeft: '2%', userSelect: 'none' }}>
                                            No se han encontrado
                                        </Typography>
                                    )}
                                </List>
                            </div>
                        ) : (
                            <div>
                                {isTrainer && (
                                    <IconButton
                                        color="inherit"
                                        onClick={handleUsersList}
                                        sx={{
                                            borderRadius: '50px',
                                            marginBottom: '5px',
                                            marginLeft: '3%',
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
                                        }}
                                    >
                                        <ArrowBackIcon />
                                    </IconButton>
                                )}
                                <Divider />
                                {selectedCustomer ? (
                                    groups.map((group) => (
                                        <div key={group.id}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', paddingLeft: '2%', userSelect: 'none' }}>
                                                {group.name}
                                            </Typography>
                                            <List>
                                                {muscles
                                                    .filter((muscle) => muscle.groupId === group.id)
                                                    .map((muscle) => (
                                                        <ListItem key={muscle.id} disablePadding>
                                                            <ListItemButton onClick={() => handleMuscleSelection(muscle)}>
                                                                <ListItemIcon>
                                                                    <FitnessCenterIcon />
                                                                </ListItemIcon>
                                                                <ListItemText primary={muscle.name} />
                                                            </ListItemButton>
                                                        </ListItem>
                                                    ))}
                                            </List>
                                            <Divider />
                                        </div>
                                    ))
                                ) : (
                                    groups.map((group) => (
                                        <div key={group.id}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', paddingLeft: '2%', userSelect: 'none' }}>
                                                {group.name}
                                            </Typography>
                                            <List>
                                                {muscles
                                                    .filter((muscle) => muscle.groupId === group.id)
                                                    .map((muscle) => (
                                                        <ListItem key={muscle.id} disablePadding>
                                                            <ListItemButton onClick={() => handleMuscleSelection(muscle)}>
                                                                <ListItemIcon>
                                                                    <FitnessCenterIcon />
                                                                </ListItemIcon>
                                                                <ListItemText primary={muscle.name} />
                                                            </ListItemButton>
                                                        </ListItem>
                                                    ))}
                                            </List>
                                            <Divider />
                                        </div>
                                    ))
                                )}
                            </div>
                        )
                    )}
                </Drawer>
                <Main open={open} style={{ paddingTop: '80px' }}>
                    {renderMainContent()}
                </Main>
            </Box >
        </>
    );
}
