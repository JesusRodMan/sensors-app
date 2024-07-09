import LoginForm from '@/components/login.component';
import Background from '@/components/background.component';


const LoginPage = () => {
  return (
    <>
      <Background />
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '600px',
          padding: '1rem',
          boxSizing: 'border-box',
        }}>
          <LoginForm />
        </div>
      </div>
    </>
  );
};

export default LoginPage;
