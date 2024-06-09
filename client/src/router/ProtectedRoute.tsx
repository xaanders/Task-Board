import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth";
import { useEffect } from "react";
import Loading from "../components/Common/Loading";

function ProtectedRoute({ children }: { children: JSX.Element }) {
    let {isTokenFetched, accessToken} = useAuth();

    let location = useLocation();

    if (!accessToken && isTokenFetched) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    } else if(accessToken) {
      return children;
    } else {
      return <Loading/>
    }
  }

  export default ProtectedRoute