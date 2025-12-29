import crypto from "crypto";
import { aesConfig } from "../../config/env";
import { IAesEncryptionService } from "../../domain/interfaces/services/IAesEncryption.service";

export class AesEncryptionServiceImpl implements IAesEncryptionService {
  
  private readonly key: Buffer;

  constructor() {
    if (!aesConfig.aesSalt) throw new Error("AES salt is not defined");
    this.key = crypto.createHash("sha256").update(aesConfig.aesSalt).digest();
  }

  async encrypt(text: string): Promise<string> {
    try {
      console.log("🔑 [ENCRYPT] Starting encryption...");
      const algorithm = aesConfig.algorithm as string;
      const inputEncoding = (aesConfig.inputEncoding) as BufferEncoding;
      const outputEncoding = (aesConfig.outputEncoding) as BufferEncoding;
      const separator = aesConfig.separator as string;

    if (!text) {
      console.error("❌ [ENCRYPT] ERROR: text is undefined or empty!");
    }

      const iv = crypto.randomBytes(aesConfig.ivLength || 16);
      console.log("🔑 [ENCRYPT] Generated IV:", iv.toString(outputEncoding));

      const cipher = crypto.createCipheriv(algorithm, this.key, iv);
      console.log("✅ [ENCRYPT] Cipher created successfully");

      let encrypted = cipher.update(text, inputEncoding, outputEncoding);

      encrypted += cipher.final(outputEncoding);

      const result = iv.toString(outputEncoding) + separator + encrypted;

      return iv.toString(outputEncoding) + separator + encrypted;
    } catch (error) {
      console.log("Token encryption error : ",error);
      throw new Error("Encryption failed");
    }
  }

  async decrypt(encryptedText: string): Promise<string> {
    try {
      console.log("🔑 Starting decryption...");
      const algorithm = aesConfig.algorithm as string;
      const inputEncoding = (aesConfig.inputEncoding) as BufferEncoding;
      const outputEncoding = (aesConfig.outputEncoding) as BufferEncoding;
      const separator = aesConfig.separator as string;

      const [ivStr, encrypted] = encryptedText.split(separator);

    if (!ivStr || !encrypted) {
      console.error("❌ Invalid encrypted data format, missing IV or encrypted part.");
      throw new Error("Invalid encrypted data format");
    }

      const iv = Buffer.from(ivStr, outputEncoding);

      console.log("🛠️ Creating decipher instance...");
      const decipher = crypto.createDecipheriv(algorithm, this.key, iv);

      console.log("🔓 Starting decryption process...");
      let decrypted = decipher.update(encrypted, outputEncoding, inputEncoding);

      decrypted += decipher.final(inputEncoding);

      return decrypted;
    } catch (error) {
      console.log("token decryption error : ",error);
      throw new Error("Decryption failed");
    }
  }
}
