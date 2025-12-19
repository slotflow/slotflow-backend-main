export interface CredentialProps {
    _id: string,
    userId: string,
    accessToken: string,
    refreshToken: string,
    expiryDate: Date,
    createdAt: Date,
    updatedAt: Date,
}