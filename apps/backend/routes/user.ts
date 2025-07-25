require("dotenv").config();
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginSchema, SignupSchema } from "@repo/types";
import { prisma } from "@repo/db/client";

const userRouter: Router = Router();

const JWT_SECRET = process.env.JWT_SECRET!;

userRouter.post("/signup", async ( req,res ) => {
    const parsedData = SignupSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid request body" });
        return;
    }

    const { email, password, name } = parsedData.data;

    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
        res.status(400).json({ message: "User already exists" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({ 
        data: { 
            email,
            password: hashedPassword,
            name: name
        }
    });

    const token = jwt.sign({ userId: user.id, name: name }, JWT_SECRET, { expiresIn: "1Day" });
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',  
        domain: '.krishdev.xyz',
        path: '/',      
        maxAge: 60 * 60 * 1000   
    });
    res.status(200).json({ message: "User created successfully", token });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
})


userRouter.post("/login", async ( req,res ) => {
    const parsedData = LoginSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid request body" });
        return;
    }

    const { email, password } = parsedData.data;
    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
    }
    const user = await prisma.user.findUnique({ where: {
            email : email
        } 
    });
    if (!user) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1Day" });
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',  
        domain: '.krishdev.xyz',
        path: '/',      
        maxAge: 60 * 60 * 1000
    });
    res.status(200).json({ message: "User logged in successfully", token: token, name: user.name });
})


export default userRouter;
