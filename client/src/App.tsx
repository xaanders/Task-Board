import './App.css';
import Dashboard from './dashboard/Dashboard';
import { Bounce, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactLoading from 'react-loading';
import { useAppContext } from './store';

function App() {
  const { isLoading } = useAppContext();
  console.log('loading', isLoading);

  return (
    <>
      <Dashboard />
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
        <div className="overlay">
          <ReactLoading type={'bubbles'} color={"#fff"} height={667} width={375} />
        </div> : <></>
      }
    </>
  )

}

export default App;
