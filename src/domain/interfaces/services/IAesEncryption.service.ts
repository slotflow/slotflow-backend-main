export interface IAesEncryption {

    encrypt(text: string): Promise<string>;

    decrypt(encryptedText: string): Promise<string>;
    
}