import Background from '@/components/background.component';
import CircularProgress from '@mui/material/CircularProgress';
import LoginPage from '@/app/login/page'
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <Background />
      <Suspense fallback={
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
          }}
        >
          <CircularProgress color="inherit" size={90} />
        </div>
      }>
        <LoginPage />
      </Suspense>
    </>
  );
}
