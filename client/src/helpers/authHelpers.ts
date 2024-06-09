import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    exp: number;
}

export const isTokenValid = (token: string | null): boolean => {
    if (!token) return false;

    try {
        const decodedToken: DecodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Time in seconds

        return decodedToken.exp > currentTime;
    } catch (error) {
        console.error('Invalid token:', error);
        return false;
    }
};

