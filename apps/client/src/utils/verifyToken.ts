import jwt from 'jsonwebtoken'


interface JWT_PAYLOAD {
  exp: number;
  iat: number;
  userId: string;
  name: string;
}

export function verifyToken(token: string | null): boolean {
    if (!token) return false;
    try {
      const actualToken = token.split(" ")[1];
      const decoded = jwt.decode(actualToken) as JWT_PAYLOAD;
      const isExpired = decoded && decoded.exp && Date.now() >= decoded.exp * 1000;
      if (isExpired) {
        return false;
      }
      return true;
    } catch (err) {
      console.error("Token verification failed:", err);
      return false;
    }
}