import { verifyToken } from "./verifyToken";

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/signin';
    }

    verifyToken(token, (isValid) => {
        if (isValid) {
            return children;
        } else {
            localStorage.removeItem('token');
            window.location.href = '/signin';
        }
    });

    return children;
};

export default ProtectedRoute;