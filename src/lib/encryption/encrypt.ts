import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

/**
 * Get encryption key from environment variable
 * The key should be a 32-byte (256-bit) hex string
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }

  // If key is hex string, convert to buffer
  if (/^[0-9a-fA-F]{64}$/.test(key)) {
    return Buffer.from(key, 'hex')
  }

  // If key is a passphrase, derive a key using scrypt
  // For now, we'll require hex format for simplicity
  throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)')
}

/**
 * Encrypt a string using AES-256-GCM
 * @param text Plain text to encrypt
 * @returns Base64 encoded string in format: iv:authTag:ciphertext
 */
export async function encrypt(text: string): Promise<string> {
  try {
    const key = getEncryptionKey()
    const iv = randomBytes(12) // 12 bytes for GCM
    const cipher = createCipheriv('aes-256-gcm', key, iv)

    let encrypted = cipher.update(text, 'utf8', 'base64')
    encrypted += cipher.final('base64')
    const authTag = cipher.getAuthTag()

    // Format: iv:authTag:ciphertext (all base64)
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt a string encrypted with AES-256-GCM
 * @param encryptedText Base64 encoded string in format: iv:authTag:ciphertext
 * @returns Decrypted plain text
 */
export async function decrypt(encryptedText: string): Promise<string> {
  try {
    const key = getEncryptionKey()
    const parts = encryptedText.split(':')
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format')
    }

    const [ivBase64, authTagBase64, ciphertext] = parts
    const iv = Buffer.from(ivBase64, 'base64')
    const authTag = Buffer.from(authTagBase64, 'base64')
    const decipher = createDecipheriv('aes-256-gcm', key, iv)
    
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(ciphertext, 'base64', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Generate a random encryption key (for setup purposes)
 * @returns 64-character hex string (32 bytes)
 */
export function generateKey(): string {
  return randomBytes(32).toString('hex')
}

