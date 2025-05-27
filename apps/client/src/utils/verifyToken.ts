import { BACKEND_URL } from '../config';
import axios from 'axios';

export async function verifyToken(token: string | null): Promise<boolean> {
    if (!token) return false;
    try {
      const res = await axios.get(`${BACKEND_URL}/verify-token`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      if (res.status === 200) {
        return true;
      }
      return false;
    } catch (err) {
      console.error("Token verification failed:", err);
      return false;
    }
}