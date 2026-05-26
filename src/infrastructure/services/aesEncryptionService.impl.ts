import crypto from "crypto";
import { aesConfig } from "../../config/env";
import { ERROR_CODES } from "../../shared/utils/types";
import { AppError, BadRequestError } from "../../shared/error/appError";
import { IAesEncryptionService } from "../../domain/interfaces/services/IAesEncryption.service";

export class AesEncryptionServiceImpl implements IAesEncryptionService {

  private readonly key: Buffer;

  constructor() {
    if (!aesConfig.aesSalt) {
      throw new AppError(
        "AES configuration missing",
        500,
        false,
        ERROR_CODES.AES_ENCRYPT_FAIL
      );
    }
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
        throw new BadRequestError(
          "Text to encrypt is required",
          ERROR_CODES.INVALID_REQUEST
        );
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
      console.log("Token encryption error : ", error);
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        "Encryption failed",
        500,
        false,
        ERROR_CODES.AES_ENCRYPT_FAIL
      );
    }
  }

  async decrypt(encryptedText: string): Promise<string> {
    try {
      if (!encryptedText) {
        throw new BadRequestError(
          "Encrypted text is required",
          ERROR_CODES.INVALID_REQUEST
        );
      }
      console.log("🔑 Starting decryption...");
      const algorithm = aesConfig.algorithm as string;
      const inputEncoding = (aesConfig.inputEncoding) as BufferEncoding;
      const outputEncoding = (aesConfig.outputEncoding) as BufferEncoding;
      const separator = aesConfig.separator as string;

      const [ivStr, encrypted] = encryptedText.split(separator);

      if (!ivStr || !encrypted) {
        console.error("❌ Invalid encrypted data format, missing IV or encrypted part.");
        throw new BadRequestError(
          "Invalid encrypted data format",
          ERROR_CODES.AES_DECRYPT_FAIL
        );
      }

      const iv = Buffer.from(ivStr, outputEncoding);

      console.log("🛠️ Creating decipher instance...");
      const decipher = crypto.createDecipheriv(algorithm, this.key, iv);

      console.log("🔓 Starting decryption process...");
      let decrypted = decipher.update(encrypted, outputEncoding, inputEncoding);

      decrypted += decipher.final(inputEncoding);

      return decrypted;
    } catch (error) {
      console.log("token decryption error : ", error);
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        "Decryption failed",
        500,
        false,
        ERROR_CODES.AES_DECRYPT_FAIL
      );
    }
  }
}
