import { NextFunction, Request, Response } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { appConfig } from "../../config/env";


export class GoogleAuthController {
    constructor(

    ) {

    }

    async googleAuth(req: Request, res: Response, next: NextFunction) {

        try {   
            console.log("googleAuth");
            
            const role = req.query.role;
            
            console.log("role : ",role);
            
            passport.authenticate("google", {
                scope: ["openid", "profile", "email"],
                session: false,
                state: JSON.stringify({ role }) ,
            })(req, res, next);
        } catch (error) {
            console.log("google auth controller error : ",error);
        }
    }

    async googleAuthCallback(req: Request, res: Response) {
        try {

            passport.authenticate("google", { session: false }, (err, user) => {
                if (err || !user) {
                    return res.redirect("/login?error=google_auth_failed");
                }
                
                console.log("user : ",user);
                
                const token = jwt.sign(
                    { id: user._id, role: user.role },
                process.env.JWT_SECRET!,
                { expiresIn: "1h" }
            );
            
            
            const authUser = { ...user, token };
            
            console.log("authUser : ",authUser);
            
            res.cookie("token", authUser.token, {
                maxAge: 2 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: appConfig.nodeEnv === "development" ? "lax" : "none",
                secure: appConfig.nodeEnv !== "development",
            });
            
            const { token: _, ...authUserWithoutToken } = authUser;
            
            res.json({
                success: true,
                message: "Google login successful",
                authUser: authUserWithoutToken,
            });
        })(req, res);
    } catch (error) {
        console.log("gooe auth callback error : ",error);
    }
    }
}

const googleAuthController = new GoogleAuthController();
export { googleAuthController };