import axios from "axios";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import OTP from "../models/otpModel.js";
import getDesignedEmail from "../lib/emailDesigner.js";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASSWORD,
    },
});


/* =========================
   CREATE USER
========================= */

export async function createUser(req, res) {
    try {
        const hashedPassword = bcrypt.hashSync(
            req.body.password,
            10
        );

        await User.create({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hashedPassword,
        });

        res.json({
            message: "User created successfully",
        });

        } catch (err) {
            console.error("CREATE USER ERROR:", err);

            res.status(500).json({
                success: false,
                message: "Failed to create user",
                error: err.message,
            });
        }
}


/* =========================
   LOGIN
========================= */

export async function loginUser(req, res) {
    try {
        const user = await User.findByEmail(
            req.body.email
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (user.isBlock) {
            return res.status(403).json({
                message:
                    "Your account has been blocked. Please contact admin.",
            });
        }

        const isPasswordMatching =
            bcrypt.compareSync(
                req.body.password,
                user.password
            );

        if (!isPasswordMatching) {
            return res.status(401).json({
                message: "Invalid password",
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                image: user.image,
            },
            process.env.JWT_SECRET
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                image: user.image,
            },
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Login failed",
        });
    }
}


/* =========================
   ADMIN CHECK
========================= */

export function isAdmin(req) {
    if (!req.user) {
        return false;
    }

    return req.user.role === "admin";
}


/* =========================
   CUSTOMER CHECK
========================= */

export function isCustomer(req) {
    if (!req.user) {
        return false;
    }

    return req.user.role === "user";
}


/* =========================
   GET CURRENT USER
========================= */

export function getUser(req, res) {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    res.json(req.user);
}


/* =========================
   GOOGLE LOGIN
========================= */

export async function googleLogin(req, res) {
    const token = req.body.token;

    if (!token) {
        return res.status(400).json({
            message: "Token is required",
        });
    }

    try {
        const googleResponse = await axios.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const googleUser = googleResponse.data;

        let user = await User.findByEmail(
            googleUser.email
        );

        /* CREATE NEW GOOGLE USER */

        if (!user) {
            user = await User.create({
                email: googleUser.email,
                firstName: googleUser.given_name || "",
                lastName: googleUser.family_name || "",
                password: "abc",
                isEmailVerified:
                    googleUser.email_verified || false,
                image:
                    googleUser.picture || "/user.png",
            });
        }

        /* BLOCK CHECK */

        if (user.isBlock) {
            return res.status(403).json({
                message:
                    "Your account has been blocked. Please contact admin.",
            });
        }

        /* JWT */

        const jwtToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                image: user.image,
            },
            process.env.JWT_SECRET
        );

        res.json({
            message: "Login successful",

            token: jwtToken,

            user: {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isEmailVerified:
                    user.isEmailVerified,
                image: user.image,
            },
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Failed to login with google",
        });
    }
}


/* =========================
   GET ALL USERS
========================= */

export async function getAllUsers(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({
            message: "Forbidden",
        });
    }

    try {
        const users = await User.findAll();

        res.json(users);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Failed to get users",
        });
    }
}


/* =========================
   BLOCK / UNBLOCK USER
========================= */

export async function blockOrUnblockUser(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({
            message: "Forbidden",
        });
    }

    if (req.user.email === req.params.email) {
        return res.status(400).json({
            message: "You cannot block yourself",
        });
    }

    try {
        await User.updateByEmail(
            req.params.email,
            {
                isBlock: req.body.isBlock,
            }
        );

        res.json({
            message:
                "User block status updated successfully",
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message:
                "Failed to block/unblock user",
        });
    }
}


/* =========================
   SEND OTP
========================= */

export async function sendOTP(req, res) {
    const email = req.params.email;

    if (!email) {
        return res.status(400).json({
            message: "Email is required",
        });
    }

    const otp = String(
        Math.floor(
            100000 + Math.random() * 900000
        )
    );

    try {
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        await OTP.deleteMany({
            email,
        });

        await OTP.create({
            email,
            otp,
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP for Password Reset",

            text: `Hi! Your one-time passcode is ${otp}. It’s valid for 10 minutes. If you didn’t request this, ignore this email. — Crystal Beauty Clear`,

            html: getDesignedEmail({
                otp,
                firstName:
                    user.firstName || "there",
                brandName:
                    "Crystal Beauty Clear",
                supportEmail:
                    "support@cbc.com",
                colors: {
                    accent: "#fa812f",
                    primary: "#fef3e2",
                    secondary: "#393e46",
                },
            }),
        });

        res.json({
            message: "OTP sent to your email",
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Failed to send OTP",
        });
    }
}


/* =========================
   CHANGE PASSWORD VIA OTP
========================= */

export async function changePasswordViaOTP(
    req,
    res
) {
    const {
        email,
        otp,
        newPassword
    } = req.body;

    try {
        const otpRecord = await OTP.findOne({
            email,
            otp,
        });

        if (!otpRecord) {
            return res.status(400).json({
                message: "Invalid OTP",
            });
        }

        await OTP.deleteMany({
            email,
        });

        const hashedPassword =
            bcrypt.hashSync(
                newPassword,
                10
            );

        await User.updateByEmail(
            email,
            {
                password: hashedPassword,
            }
        );

        res.json({
            message:
                "Password changed successfully",
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message:
                "Failed to change password",
        });
    }
}


/* =========================
   UPDATE USER DATA
========================= */

export async function updateUserData(
    req,
    res
) {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    try {
        await User.updateByEmail(
            req.user.email,
            {
                firstName:
                    req.body.firstName,
                lastName:
                    req.body.lastName,
                image:
                    req.body.image,
            }
        );

        res.json({
            message:
                "User data updated successfully",
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message:
                "Failed to update user data",
        });
    }
}


/* =========================
   UPDATE PASSWORD
========================= */

export async function updatePassword(
    req,
    res
) {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const {
        currentPassword,
        newPassword
    } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            message: "Missing fields",
        });
    }

    try {
        const user =
            await User.findByEmail(
                req.user.email
            );

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const isMatch =
            bcrypt.compareSync(
                currentPassword,
                user.password
            );

        if (!isMatch) {
            return res.status(400).json({
                message:
                    "Current password is incorrect",
            });
        }

        const hashedPassword =
            bcrypt.hashSync(
                newPassword,
                10
            );

        await User.updateByEmail(
            req.user.email,
            {
                password: hashedPassword,
            }
        );

        res.json({
            message:
                "Password updated successfully",
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message:
                "Failed to update password",
        });
    }
}
