import { Bounce, ToastContainer } from 'react-toastify';
import './App.css';
import AppRoutes from './router/Routes';
import { useAppContext } from './store';
import Loading from './components/Common/Loading';

function App() {
  const { isLoading } = useAppContext();

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
