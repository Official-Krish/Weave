import { verifyToken } from "./verifyToken";

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/signin';
    }

    const verified = verifyToken(token);
    if (!verified) {
        localStorage.removeItem('token');
        window.location.href = '/signin';
    }

    return children;
};

export default ProtectedRoute;