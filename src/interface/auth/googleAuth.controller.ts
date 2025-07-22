import { Request, Response } from "express";

export class GoogleAuthController {
    constructor(

    ) {

    }

    async googleAuth(req:Request, res: Response) {

    }

    async googleAuthCallback(req: Request, res: Response) {
        
    }
}

const googleAuthController = new GoogleAuthController();
export { googleAuthController };