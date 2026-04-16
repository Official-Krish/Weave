import { prisma } from "@repo/db/client";
import { googleAuthSchema } from "@repo/types";
import express from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const JWT_SECRET = process.env.JWT_SECRET!;

const client = new OAuth2Client(CLIENT_ID);
const GoogleRouter = express.Router();

GoogleRouter.post("/auth", async (req, res) => {
    try {
        const parsedSchema = googleAuthSchema.safeParse(req.body);

        if (!parsedSchema.success) {
            return res.status(400).json({ message: "Invalid request body" });
        }

        const { idToken } = parsedSchema.data;

        if (!idToken) {
            return res.status(400).json({ message: "Missing idToken" });
        }

        const ticket = await client.verifyIdToken({
            idToken,
            audience: CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            return res.status(401).json({ message: "Invalid Google token" });
        }

        const { sub, email, name } = payload;

        let user = await prisma.user.findFirst({
            where: { email: email.toLowerCase() },
        });

        let isNewUser = false;

        if (!user) {
            isNewUser = true;

            user = await prisma.user.create({
                data: {
                    email: email.toLowerCase(),
                    name,
                    googleId: sub,
                },
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.json({
            message: isNewUser ? "Signup successful" : "Signin successful",
            token,
            name: user.name,
        });

    } catch (err) {
        console.error(err);
        return res.status(401).json({ message: "Google auth failed" });
    }
});

export default GoogleRouter;