import crypto from 'crypto';

/**
 * Service for encrypting and decrypting sensitive data like Reddit API tokens
 */
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;
  private readonly iv: Buffer;

  constructor() {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    const encryptionIV = process.env.ENCRYPTION_IV;

    if (!encryptionKey || !encryptionIV) {
      throw new Error('ENCRYPTION_KEY and ENCRYPTION_IV must be set in environment variables');
    }

    // Ensure the key is exactly 32 bytes (256 bits)
    this.key = Buffer.from(encryptionKey, 'hex');
    if (this.key.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
    }

    // Ensure the IV is exactly 16 bytes (128 bits)
    this.iv = Buffer.from(encryptionIV, 'hex');
    if (this.iv.length !== 16) {
      throw new Error('ENCRYPTION_IV must be a 32-character hex string (16 bytes)');
    }
  }

  /**
   * Encrypts a plain text string
   * @param text - The plain text to encrypt
   * @returns The encrypted text as a hex string
   */
  encrypt(text: string): string {
    try {
      const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypts an encrypted text string
   * @param encryptedText - The encrypted text as a hex string
   * @returns The decrypted plain text
   */
  decrypt(encryptedText: string): string {
    try {
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export a singleton instance
export const encryptionService = new EncryptionService(); 