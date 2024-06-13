import { Bounce, ToastContainer } from 'react-toastify';
import './App.css';
import AppRoutes from './router/Routes';
import { useAppContext } from './store';
import Loading from './components/Common/Loading';
import { useAuth } from './store/auth';
import { useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { isLoading } = useAppContext();
  const {refreshToken, accessToken, user} = useAuth();

  useEffect(() => {
    if(!accessToken && !user)
      refreshToken();
  }, [accessToken, refreshToken, user])

  return (
    <div className="app">
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      {isLoading ?
        <Loading /> : <></>
      }
    </div>
  )

}

export default App;
