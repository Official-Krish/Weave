import { Router, type Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginSchema, SignupSchema } from "@repo/types";
import { prisma } from "@repo/db/client";

const userRouter: Router = Router();

const JWT_SECRET = process.env.JWT_SECRET;

function ensureJwtSecret(res: Response) {
    if (!JWT_SECRET) {
        res.status(500).json({ message: "JWT_SECRET is not configured" });
        return null;
    }

    return JWT_SECRET;
}

userRouter.post("/signup", async ( req,res ) => {
        const jwtSecret = ensureJwtSecret(res);
        if (!jwtSecret) {
            return;
        }

    const parsedData = SignupSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid request body" });
        return;
    }

    const { email, password, name } = parsedData.data;

    try {
        const existingUser = await prisma.user.findFirst({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({ 
        data: { 
            email,
            password: hashedPassword,
            name: name
        }
    });

    const token = jwt.sign({ userId: user.id, name }, jwtSecret, { expiresIn: "7Days" });
    res.status(200).json({ message: "User created successfully", token });
    } catch (error) {
        console.error("Signup failed:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})


userRouter.post("/login", async ( req,res ) => {
    const jwtSecret = ensureJwtSecret(res);
    if (!jwtSecret) {
      return;
    }

    const parsedData = LoginSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid request body" });
        return;
    }

    const { email, password } = parsedData.data;
    try {
        const user = await prisma.user.findUnique({ where: {
                email : email
            } 
        });
        if (!user || !user.password) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }

        const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "7Days" });
        res.status(200).json({ message: "User logged in successfully", token, name: user.name });
    } catch (error) {
        console.error("Login failed:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})


export default userRouter;
