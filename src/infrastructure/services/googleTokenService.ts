// import { log } from "../../shared/logger/logger";
// import { googleClientConfig } from "../../config/env";
// import { GetCredentialUseCase, UpdateCredentialUseCase } from "../../application/useCases/common/credential.useCase";

// TODO REMOVE

// export class GoogleTokenService {
//     constructor(
//         private getCredentialUseCase: GetCredentialUseCase,
//         private updateCredentialUseCase: UpdateCredentialUseCase
//     ) { }

//     async getValidAccessToken(userId: string): Promise<string> {
//         try {
//             console.log("GoogleTokenService service start");
//             console.log("Before credentials")
//             const credentials = await this.getCredentialUseCase.execute({userId});
//             console.log("after credentials ");
                        
//             if(!credentials) throw new Error("Credentials fetchinga failed");
//             const now = new Date();
            
//             if (!credentials.accessToken || now > credentials.expiryDate) {

//                 if (!credentials.refreshToken) throw new Error("No refresh token found");

//                 const response = await fetch("https://oauth2.googleapis.com/token", {
//                     method: "POST",
//                     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//                     body: new URLSearchParams({
//                         client_id: googleClientConfig.googleClientId!,
//                         client_secret: googleClientConfig.googleClientSecret!,
//                         refresh_token: credentials.refreshToken,
//                         grant_type: "refresh_token",
//                     }),
//                 });

//                 const data = await response.json();
//                 console.log("GOOGLE TOKEN ERROR RESPONSE : ",data);
//                 if (!data.access_token) throw new Error("Failed to refresh access token");

//                 credentials.accessToken = data.access_token;
//                 if (data.refresh_token) {
//                     credentials.refreshToken = data.refresh_token;
//                 }
//                 credentials.expiryDate = new Date(Date.now() + data.expires_in * 1000);
//                 if (!credentials.accessToken) throw new Error("Failed to refresh access token");

//                 // const res = await this.updateCredentialUseCase.execute(credentials);
//                 // if(!res.success) throw new Error("Credentials updation error");
//             }
//             console.log("GoogleTokenService service end");
//             return credentials.accessToken;
//         } catch (error) {
//             log.error("GoogleTokenService failed", error as Error);
//             throw error;
//         }
//     }
// }
