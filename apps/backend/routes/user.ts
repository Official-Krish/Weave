import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginSchema, SignupSchema } from "@repo/types";
import { prisma } from "@repo/db/client";
import { authMiddleware } from "../utils/authMiddleware";

const userRouter: Router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

userRouter.post("/signup", async ( req,res ) => {
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
            email: email.toLowerCase(),
            password: hashedPassword,
            name: name
        }
    });

    const token = jwt.sign({ userId: user.id, name }, JWT_SECRET, { expiresIn: "7Days" });
    res.status(200).json({ message: "User created successfully", token });
    } catch (error) {
        console.error("Signup failed:", error);
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
    try {
        const user = await prisma.user.findFirst({ where: {
                email : email.toLowerCase()
            } 
        });
        if (!user || !user.password) {
            res.status(403).json({ message: "Invalid email or password" });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(403).json({ message: "Invalid email or password" });
            return;
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7Days" });
        res.status(200).json({ message: "User logged in successfully", token, name: user.name });
    } catch (error) {
        console.error("Login failed:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

userRouter.get("/me", authMiddleware, async (req, res) => {
    const userId = req.userId;

    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const user = await prisma.user.findFirst({
            where: { id: userId },
            select: {
                name: true,
                email: true,
            },
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({
            message: "User profile fetched successfully",
            user,
        });
    } catch (error) {
        console.error("Fetch profile failed:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

userRouter.get("/profile", authMiddleware, async (req, res) => {
    const userId = req.userId;

    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const user = await prisma.user.findFirst({
            where: { id: userId },
            select: {
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                meetings: {
                    select: {
                        roomName: true,
                        roomId: true,
                        startTime: true,
                        endTime: true,
                        isHost: true,
                        joinedParticipants: true,
                    },
                }
            },
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({
            user
        });
    } catch (error) {
        console.error("Fetch profile failed:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

userRouter.post("/update-profile", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const { name } = req.body;

    if (!userId || !name) {
        res.status(403).json({ message: "Missing required fields" });
        return;
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { 
                name,
                updatedAt: new Date(), 
            },
            select: {
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        res.status(200).json({
            message: "User profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Update profile failed:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default userRouter;