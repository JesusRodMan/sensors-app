"use client";
import { User } from "@prisma/client";
import { createContext, useContext, useEffect, useState } from "react";

export type UserContextProps = {
  user: User | null;
  setUser: (user: User | null) => void;
  error: string | null;
};

export const UserContext = createContext<UserContextProps>({
  user: null,
  setUser: () => {},
  error: null,
});

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({
  userDataServerSide,
  children,
}: {
  userDataServerSide: User | null;
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(userDataServerSide);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userDataServerSide) {
      setUser(userDataServerSide);
    }
  }, [userDataServerSide]);

  return (
    <UserContext.Provider value={{ user, setUser, error }}>
      {children}
    </UserContext.Provider>
  );
};