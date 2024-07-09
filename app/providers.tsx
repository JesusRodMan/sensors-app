import { User } from "@prisma/client";
import { UserProvider } from "./login/providers/user.provider";

interface ProvidersProps {
  user: User | null;
  children: React.ReactNode;
}

export async function Providers({ user, children }: ProvidersProps) {
  return <UserProvider userDataServerSide={user}>{children}</UserProvider>;
}
