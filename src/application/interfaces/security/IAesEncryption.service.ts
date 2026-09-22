export interface IAesEncryptionService {

    encrypt(text: string): Promise<string>;

    decrypt(encryptedText: string): Promise<string>;
    
}