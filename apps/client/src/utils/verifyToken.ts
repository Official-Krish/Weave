import { BACKEND_URL } from '../config';

export function verifyToken(token: string | null, callback: (isValid: boolean) => void): void {
    if (!token) {
        callback(false);
        return;
    }
    
    try {
        fetch(`${BACKEND_URL}/verify-token`, {
            headers: {
                Authorization: `${token}`,
            },
        })
        .then((res) => {
            if (res.status === 200) {
                callback(true);
            } else {
                callback(false);
            }
        })
        .catch((err) => {
            console.error("Token verification failed:", err);
            callback(false);
        });
    } catch (err) {
        console.error("Token verification failed:", err);
        callback(false);
    }
}