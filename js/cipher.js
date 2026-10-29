/**
 * CIPHERGUARD — Core Cryptographic Module
 * DecodeLabs Industrial Training Kit 2026 | Project 2: Basic Encryption & Decryption
 * 
 * Classical Caesar substitution cipher implementation with user-configurable shift,
 * full ASCII/Unicode preservation, normalized shift wrapping, and round-trip verification.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CipherGuard = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const ALPHABET_SIZE = 26;
  const UPPER_BASE = 65; // 'A'
  const LOWER_BASE = 97; // 'a'

  /**
   * Normalizes any integer shift key to a canonical value in range [0, 25].
   * Handles negative shifts and shifts >= 26 using proper modulo arithmetic.
   * 
   * @param {number|string} shift - Integer shift key
   * @returns {number} Normalized shift key in range [0, 25]
   * @throws {TypeError} If shift is not an integer or cannot be parsed as one
   */
  function normalizeShift(shift) {
    if (shift === null || shift === undefined || shift === '') {
      throw new TypeError('Shift key must not be empty. Please enter an integer.');
    }

    const num = Number(shift);
    if (!Number.isFinite(num) || !Number.isInteger(num)) {
      throw new TypeError(`Invalid shift key "${shift}". Shift key must be a whole integer.`);
    }

    // Mathematical modulo: handles negative numbers accurately
    return ((num % ALPHABET_SIZE) + ALPHABET_SIZE) % ALPHABET_SIZE;
  }

  /**
   * Encrypts plaintext using the classical Caesar cipher.
   * Shifts English alphabetic characters forward by `shift` positions.
   * Preserves letter case, numbers, punctuation, spaces, and Unicode code points.
   * 
   * @param {string} plaintext - Original input text to encrypt
   * @param {number|string} shift - Integer shift key
   * @returns {string} Encrypted ciphertext
   */
  function caesarEncrypt(plaintext, shift) {
    if (plaintext === null || plaintext === undefined) {
      return '';
    }

    if (typeof plaintext !== 'string') {
      plaintext = String(plaintext);
    }

    if (plaintext.length === 0) {
      return '';
    }

    const k = normalizeShift(shift);

    // Fast-path: shift of 0 or multiple of 26 leaves text unchanged
    if (k === 0) {
      return plaintext;
    }

    let result = '';
    for (let i = 0; i < plaintext.length; i++) {
      const code = plaintext.charCodeAt(i);

      // Uppercase letters 'A' through 'Z'
      if (code >= UPPER_BASE && code <= UPPER_BASE + ALPHABET_SIZE - 1) {
        result += String.fromCharCode(((code - UPPER_BASE + k) % ALPHABET_SIZE) + UPPER_BASE);
      }
      // Lowercase letters 'a' through 'z'
      else if (code >= LOWER_BASE && code <= LOWER_BASE + ALPHABET_SIZE - 1) {
        result += String.fromCharCode(((code - LOWER_BASE + k) % ALPHABET_SIZE) + LOWER_BASE);
      }
      // Non-English alphabetic characters (spaces, punctuation, digits, Unicode) remain unchanged
      else {
        result += plaintext[i];
      }
    }

    return result;
  }

  /**
   * Decrypts ciphertext using the classical Caesar cipher.
   * Reverses encryption by shifting alphabetic characters backward by `shift` positions.
   * 
   * @param {string} ciphertext - Encrypted text to decrypt
   * @param {number|string} shift - Integer shift key used for original encryption
   * @returns {string} Decrypted original plaintext
   */
  function caesarDecrypt(ciphertext, shift) {
    if (ciphertext === null || ciphertext === undefined) {
      return '';
    }

    if (typeof ciphertext !== 'string') {
      ciphertext = String(ciphertext);
    }

    if (ciphertext.length === 0) {
      return '';
    }

    const k = normalizeShift(shift);

    // Shifting backward by k is equivalent to shifting forward by (26 - k)
    const reverseShift = (ALPHABET_SIZE - k) % ALPHABET_SIZE;
    return caesarEncrypt(ciphertext, reverseShift);
  }

  /**
   * Verifies the round-trip property of the cipher:
   * decrypt(encrypt(plaintext, shift), shift) === plaintext
   * 
   * @param {string} plaintext - Input text to verify
   * @param {number|string} shift - Integer shift key
   * @returns {boolean} True if round-trip transformation is completely lossless
   */
  function roundTripVerify(plaintext, shift) {
    const text = plaintext == null ? '' : String(plaintext);
    const encrypted = caesarEncrypt(text, shift);
    const decrypted = caesarDecrypt(encrypted, shift);
    return decrypted === text;
  }

  /**
   * Generates a 26-character alignment table for visual UI demonstration.
   * Shows how the source alphabet maps to the shifted cipher alphabet.
   * 
   * @param {number|string} shift - Integer shift key
   * @returns {{ plainUpper: string[], cipherUpper: string[], plainLower: string[], cipherLower: string[], shift: number }}
   */
  function getShiftTable(shift) {
    const k = normalizeShift(shift);
    const plainUpper = [];
    const cipherUpper = [];
    const plainLower = [];
    const cipherLower = [];

    for (let i = 0; i < ALPHABET_SIZE; i++) {
      const uPlain = String.fromCharCode(UPPER_BASE + i);
      const uCipher = String.fromCharCode(UPPER_BASE + ((i + k) % ALPHABET_SIZE));
      plainUpper.push(uPlain);
      cipherUpper.push(uCipher);

      const lPlain = String.fromCharCode(LOWER_BASE + i);
      const lCipher = String.fromCharCode(LOWER_BASE + ((i + k) % ALPHABET_SIZE));
      plainLower.push(lPlain);
      cipherLower.push(lCipher);
    }

    return {
      plainUpper,
      cipherUpper,
      plainLower,
      cipherLower,
      shift: k,
    };
  }

  /**
   * Common English words used for heuristic scoring during brute-force analysis.
   */
  const COMMON_ENGLISH_WORDS = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'hello', 'world', 'secret', 'password', 'cipher', 'message', 'attack', 'key'
  ]);

  /**
   * Frequency values of English letters (approximate percentages, ETAOIN SHRDLU).
   */
  const LETTER_FREQUENCIES = {
    e: 12.02, t: 9.10, a: 8.12, o: 7.68, i: 7.31, n: 6.95, s: 6.28, r: 6.02,
    h: 5.92, d: 4.32, l: 3.98, u: 2.88, c: 2.71, m: 2.61, f: 2.30, y: 2.11,
    w: 2.09, g: 2.03, p: 1.82, b: 1.49, v: 1.11, k: 0.69, x: 0.17, q: 0.11,
    j: 0.10, z: 0.07
  };

  /**
   * Exhaustively evaluates all 25 possible non-zero Caesar shifts against a ciphertext.
   * Demonstrates why the Caesar cipher has zero modern cryptographic security (tiny key space).
   * 
   * @param {string} ciphertext - Encrypted text to analyze
   * @returns {Array<{ shift: number, decrypted: string, score: number, matchedWords: string[] }>}
   */
  function bruteForceAnalyze(ciphertext) {
    if (!ciphertext || typeof ciphertext !== 'string' || ciphertext.trim() === '') {
      return [];
    }

    const results = [];

    for (let s = 1; s < ALPHABET_SIZE; s++) {
      const candidate = caesarDecrypt(ciphertext, s);
      
      // Extract words for dictionary match
      const words = candidate.toLowerCase().match(/[a-z]+/g) || [];
      const matchedWords = [];
      let wordScore = 0;

      for (const w of words) {
        if (COMMON_ENGLISH_WORDS.has(w)) {
          matchedWords.push(w);
          wordScore += (w.length * 10);
        }
      }

      // Letter frequency heuristic
      let freqScore = 0;
      let alphaCount = 0;
      for (let i = 0; i < candidate.length; i++) {
        const char = candidate[i].toLowerCase();
        if (LETTER_FREQUENCIES[char]) {
          freqScore += LETTER_FREQUENCIES[char];
          alphaCount++;
        }
      }

      const avgFreq = alphaCount > 0 ? (freqScore / alphaCount) : 0;
      const totalScore = Math.round((wordScore + avgFreq) * 10) / 10;

      results.push({
        shift: s,
        decrypted: candidate,
        score: totalScore,
        matchedWords,
      });
    }

    // Sort by likelihood score descending
    results.sort((a, b) => b.score - a.score);
    return results;
  }

  return {
    normalizeShift,
    caesarEncrypt,
    caesarDecrypt,
    roundTripVerify,
    getShiftTable,
    bruteForceAnalyze,
    ALPHABET_SIZE,
  };
});
