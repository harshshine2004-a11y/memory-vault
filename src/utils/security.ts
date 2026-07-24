// Zero-Knowledge End-to-End Encryption Engine (ZK-E2EE)
// AES-256-GCM + PBKDF2 Key Derivation

export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Quantum Secure';
  entropy: number;
  suggestions: string[];
}

export class SecurityEngine {
  /**
   * Calculates password entropy and strength.
   */
  static evaluatePasswordStrength(password: string): PasswordStrength {
    if (!password) {
      return { score: 0, label: 'Very Weak', entropy: 0, suggestions: ['Enter a password'] };
    }

    let entropy = 0;
    const length = password.length;
    let poolSize = 0;

    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

    entropy = Math.floor(length * Math.log2(poolSize || 1));

    const suggestions: string[] = [];
    if (length < 8) suggestions.push('Use at least 8 characters');
    if (!/[A-Z]/.test(password)) suggestions.push('Add uppercase letters');
    if (!/[0-9]/.test(password)) suggestions.push('Include numbers');
    if (!/[^a-zA-Z0-9]/.test(password)) suggestions.push('Include special symbols (@#$%)');

    let score = 0;
    if (entropy > 30) score = 1;
    if (entropy > 50) score = 2;
    if (entropy > 70) score = 3;
    if (entropy >= 90) score = 4;

    const labels: Record<number, PasswordStrength['label']> = {
      0: 'Very Weak',
      1: 'Weak',
      2: 'Medium',
      3: 'Strong',
      4: 'Quantum Secure'
    };

    return {
      score,
      label: labels[score],
      entropy,
      suggestions
    };
  }

  /**
   * Generates a SHA-256 hash for file or string data.
   */
  static async hashData(data: string | ArrayBuffer): Promise<string> {
    const encoder = new TextEncoder();
    const buffer = typeof data === 'string' ? encoder.encode(data) : data;
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Derives a ZK-E2EE Master Key locally using PBKDF2 with Web Crypto API.
   * Keys NEVER leave the user's browser device.
   */
  static async deriveMasterKey(password: string, salt: string = 'memory-vault-zk-salt'): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode(salt),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypts plain text using AES-256-GCM.
   */
  static async encryptText(plainText: string, key: CryptoKey): Promise<{ cipherText: string; iv: string }> {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(plainText)
    );

    const cipherArray = Array.from(new Uint8Array(encryptedBuffer));
    const ivArray = Array.from(iv);

    return {
      cipherText: btoa(String.fromCharCode.apply(null, cipherArray)),
      iv: btoa(String.fromCharCode.apply(null, ivArray))
    };
  }

  /**
   * Decrypts cipher text using AES-256-GCM.
   */
  static async decryptText(cipherText: string, iv: string, key: CryptoKey): Promise<string> {
    const cipherArray = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0));
    const ivArray = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivArray },
      key,
      cipherArray
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  /**
   * Generates a 6-digit TOTP 2FA simulation code.
   */
  static generate2FACode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generates a math CAPTCHA challenge for anti-brute force lockouts.
   */
  static generateCaptcha(): { question: string; answer: number } {
    const a = Math.floor(Math.random() * 12) + 2;
    const b = Math.floor(Math.random() * 12) + 2;
    const isAddition = Math.random() > 0.5;
    return {
      question: isAddition ? `What is ${a} + ${b}?` : `What is ${a} × ${b}?`,
      answer: isAddition ? a + b : a * b
    };
  }
}
