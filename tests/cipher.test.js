/**
 * CIPHERGUARD — Comprehensive Automated Test Suite
 * DecodeLabs Industrial Training Kit 2026 | Project 2: Basic Encryption & Decryption
 * 
 * Executes all 12 mandatory Phase 5 verification cases and additional cryptographic invariants.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeShift,
  caesarEncrypt,
  caesarDecrypt,
  roundTripVerify,
  getShiftTable,
  bruteForceAnalyze,
  ALPHABET_SIZE,
} = require('../js/cipher.js');

describe('PHASE 5: MANDATORY CIPHER CORRECTNESS VERIFICATION', () => {

  // Test 1: Basic encryption
  test('Test 1: Basic encryption (ABC + 3 -> DEF)', () => {
    const input = 'ABC';
    const shift = 3;
    const expected = 'DEF';
    const actual = caesarEncrypt(input, shift);
    assert.equal(actual, expected, `Expected ${expected}, got ${actual}`);
  });

  // Test 2: Alphabet wraparound
  test('Test 2: Alphabet wraparound (XYZ + 3 -> ABC)', () => {
    const input = 'XYZ';
    const shift = 3;
    const expected = 'ABC';
    const actual = caesarEncrypt(input, shift);
    assert.equal(actual, expected, `Expected ${expected}, got ${actual}`);
  });

  // Test 3: Mixed case and punctuation
  test('Test 3: Mixed case and punctuation (Hello World! + 3 -> Khoor Zruog!)', () => {
    const input = 'Hello World!';
    const shift = 3;
    const expected = 'Khoor Zruog!';
    const actual = caesarEncrypt(input, shift);
    assert.equal(actual, expected, `Expected ${expected}, got ${actual}`);
  });

  // Test 4: Decryption
  test('Test 4: Decryption (Khoor Zruog! + 3 -> Hello World!)', () => {
    const input = 'Khoor Zruog!';
    const shift = 3;
    const expected = 'Hello World!';
    const actual = caesarDecrypt(input, shift);
    assert.equal(actual, expected, `Expected ${expected}, got ${actual}`);
  });

  // Test 5: Zero shift
  test('Test 5: Zero shift (Hello + 0 -> Hello)', () => {
    const input = 'Hello';
    const shift = 0;
    const expected = 'Hello';
    const actual = caesarEncrypt(input, shift);
    assert.equal(actual, expected, `Expected ${expected}, got ${actual}`);
    assert.equal(caesarDecrypt(input, shift), expected);
  });

  // Test 6: Shift larger than alphabet length
  test('Test 6: Shift larger than alphabet length (ABC + 29 -> DEF)', () => {
    const input = 'ABC';
    const shift = 29; // 29 % 26 = 3
    const expected = 'DEF';
    const actual = caesarEncrypt(input, shift);
    assert.equal(actual, expected, `Expected ${expected}, got ${actual}`);
  });

  // Test 7: Negative shift
  test('Test 7: Negative shift (ABC + -1 -> ZAB)', () => {
    const input = 'ABC';
    const shift = -1; // -1 wraps to +25
    const expected = 'ZAB';
    const actual = caesarEncrypt(input, shift);
    assert.equal(actual, expected, `Expected ${expected}, got ${actual}`);
  });

  // Test 8: Non-alphabetic characters
  test('Test 8: Non-alphabetic characters (123 !@# + 5 -> 123 !@#)', () => {
    const input = '123 !@#';
    const shift = 5;
    const expected = '123 !@#';
    const actual = caesarEncrypt(input, shift);
    assert.equal(actual, expected, `Expected ${expected}, got ${actual}`);
  });

  // Test 9: Round-trip property
  test('Test 9: Round-trip property decrypt(encrypt(plaintext, shift), shift) === plaintext', () => {
    const testCases = [
      { text: 'The quick brown fox jumps over the lazy dog.', shift: 3 },
      { text: 'DecodeLabs Industrial Cybersecurity Kit 2026!', shift: 13 },
      { text: 'A', shift: 1 },
      { text: 'Z', shift: 25 },
      { text: 'EdgeCase123$#@\n\tMultiLine', shift: 7 },
      { text: 'NegativeShiftTest', shift: -5 },
      { text: 'MassiveShiftTest', shift: 52003 },
      { text: 'SpecialUnicode: 🛡️ Cyrillic Привет, Français Résumé', shift: 4 },
    ];

    for (const { text, shift } of testCases) {
      const isLossless = roundTripVerify(text, shift);
      assert.ok(isLossless, `Round-trip failed for "${text}" with shift ${shift}`);
      const enc = caesarEncrypt(text, shift);
      const dec = caesarDecrypt(enc, shift);
      assert.equal(dec, text, `Round-trip equality failed for shift ${shift}`);
    }
  });

  // Test 10: Unicode preservation
  test('Test 10: Unicode preservation outside English alphabet', () => {
    const input = 'Русский текст, café crème, emoji 🔐🛡️🚀, symbols π ≈ 3.14';
    const shift = 3;
    const enc = caesarEncrypt(input, shift);
    // English 'caf' -> 'caf' has 'c', 'a', 'f' shifted: c->f, a->d, f->i
    // 'cr' in crème shifted: c->f, r->u
    // 'emoji' shifted: e->h, m->p, o->r, j->m, i->l
    // 'symbols' shifted: s->v, y->b, m->p, b->e, o->r, l->o, s->v
    // Non-ASCII 'Русский текст', 'é', 'è', '🔐🛡️🚀', 'π', '≈' MUST be identical
    assert.ok(enc.includes('Русский текст'), 'Cyrillic characters must be completely preserved');
    assert.ok(enc.includes('é'), 'Accented é must be preserved');
    assert.ok(enc.includes('è'), 'Accented è must be preserved');
    assert.ok(enc.includes('🔐🛡️🚀'), 'Emojis must be completely preserved');
    assert.ok(enc.includes('π ≈ 3.14'), 'Mathematical Unicode symbols and numbers must be preserved');

    // And decrypting restores original
    const dec = caesarDecrypt(enc, shift);
    assert.equal(dec, input);
  });

  // Test 11: Empty input handling
  test('Test 11: Empty input and whitespace handling', () => {
    assert.equal(caesarEncrypt('', 3), '');
    assert.equal(caesarDecrypt('', 3), '');
    assert.equal(caesarEncrypt(null, 3), '');
    assert.equal(caesarDecrypt(undefined, 3), '');
    assert.equal(caesarEncrypt('   ', 3), '   ');
    assert.equal(caesarDecrypt('   ', 3), '   ');
  });

  // Test 12: Invalid key handling
  test('Test 12: Invalid shift key handling (throws descriptive TypeError)', () => {
    const invalidKeys = ['abc', '3.14', 3.7, NaN, Infinity, -Infinity, null, undefined, ''];

    for (const key of invalidKeys) {
      assert.throws(
        () => normalizeShift(key),
        { name: 'TypeError' },
        `Expected TypeError for key "${key}"`
      );
      assert.throws(
        () => caesarEncrypt('Hello', key),
        { name: 'TypeError' },
        `Expected TypeError when encrypting with key "${key}"`
      );
      assert.throws(
        () => caesarDecrypt('Hello', key),
        { name: 'TypeError' },
        `Expected TypeError when decrypting with key "${key}"`
      );
    }
  });
});

describe('ADDITIONAL CRYPTOGRAPHIC & LAB INVARIANTS', () => {

  test('Shift normalization handles large multiples of 26', () => {
    assert.equal(normalizeShift(0), 0);
    assert.equal(normalizeShift(26), 0);
    assert.equal(normalizeShift(52), 0);
    assert.equal(normalizeShift(-26), 0);
    assert.equal(normalizeShift(-52), 0);
    assert.equal(normalizeShift(27), 1);
    assert.equal(normalizeShift(-1), 25);
    assert.equal(normalizeShift(-27), 25);
    assert.equal(normalizeShift('-5'), 21);
    assert.equal(normalizeShift('13'), 13);
  });

  test('ROT13 symmetric self-inverse property', () => {
    const text = 'DecodeLabs Cybersecurity Batch 2026';
    const rot1 = caesarEncrypt(text, 13);
    const rot2 = caesarEncrypt(rot1, 13);
    assert.equal(rot2, text, 'ROT13 applied twice must yield original plaintext');
  });

  test('Shift table generator provides 26-element mapping', () => {
    const table = getShiftTable(3);
    assert.equal(table.shift, 3);
    assert.equal(table.plainUpper.length, 26);
    assert.equal(table.cipherUpper.length, 26);
    assert.equal(table.plainUpper[0], 'A');
    assert.equal(table.cipherUpper[0], 'D');
    assert.equal(table.plainUpper[25], 'Z');
    assert.equal(table.cipherUpper[25], 'C');
  });

  test('Brute force frequency analysis ranks likely shift highest for English plaintext', () => {
    const secret = 'The secret password to access the server is confidential.';
    const ciphertext = caesarEncrypt(secret, 7);
    const analysis = bruteForceAnalyze(ciphertext);

    assert.equal(analysis.length, 25, 'Must evaluate all 25 non-zero shifts');
    // Top candidate should identify shift = 7
    const topCandidate = analysis[0];
    assert.equal(topCandidate.shift, 7, `Expected shift 7 to be top candidate, got ${topCandidate.shift}`);
    assert.equal(topCandidate.decrypted, secret);
    assert.ok(topCandidate.matchedWords.length > 0, 'Should have matched common English dictionary words');
  });
});
