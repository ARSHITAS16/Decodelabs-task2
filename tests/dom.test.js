/**
 * CIPHERGUARD — Headless DOM Interactive Element Verification
 * DecodeLabs Industrial Training Kit 2026 | Project 2: Basic Encryption & Decryption
 * 
 * Uses JSDOM to test all actual interactive DOM elements, buttons, inputs, tabs,
 * event handlers, validation messages, and stale state warnings.
 */

const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

describe('PHASE 4 & 8: INTERACTIVE ELEMENT & UI WORKFLOW AUDIT', () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    const htmlPath = path.join(__dirname, '..', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    const cipherJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'cipher.js'), 'utf8');
    const appJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');

    dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost:3000/'
    });
    window = dom.window;
    document = window.document;

    // Provide mock clipboard API
    window.navigator.clipboard = {
      writeText: async (text) => {
        window.__copiedText = text;
        return Promise.resolve();
      }
    };
    window.isSecureContext = true;

    // Execute scripts in JSDOM context
    window.eval(cipherJs);
    window.eval(appJs);

    // Fire DOMContentLoaded
    const event = window.document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    window.document.dispatchEvent(event);
  });

  test('Interactive Element 1: Initial State & DOM Elements Mount Correctly', () => {
    const plainInput = document.getElementById('plain-input');
    const shiftInput = document.getElementById('shift-input');
    const cipherOutput = document.getElementById('cipher-output');
    const decryptedOutput = document.getElementById('decrypted-output');
    const alphabetGrid = document.getElementById('alphabet-grid');

    assert.ok(plainInput, 'Plaintext input must exist');
    assert.ok(shiftInput, 'Shift numeric input must exist');
    assert.ok(cipherOutput, 'Ciphertext output must exist');
    assert.ok(decryptedOutput, 'Decrypted output must exist');
    assert.ok(alphabetGrid, 'Alphabet ribbon must exist');

    // Default pre-population
    assert.equal(plainInput.value, 'Hello World!');
    assert.equal(shiftInput.value, '3');
    // 26 pairs of plain and cipher letters = 52 cells
    assert.equal(alphabetGrid.children.length, 52);
  });

  test('Interactive Element 2: Encrypt Button (#btn-encrypt) Transforms Plaintext', () => {
    const btnEncrypt = document.getElementById('btn-encrypt');
    const cipherOutput = document.getElementById('cipher-output');
    const decryptedOutput = document.getElementById('decrypted-output');
    const verificationBadge = document.getElementById('verification-badge');

    // Click Encrypt
    btnEncrypt.click();

    // Verify ciphertext: "Hello World!" shifted by 3 is "Khoor Zruog!"
    assert.equal(cipherOutput.textContent, 'Khoor Zruog!');
    assert.ok(!cipherOutput.classList.contains('empty'));

    // Verify decrypted verification panel
    assert.equal(decryptedOutput.textContent, 'Hello World!');
    assert.ok(!decryptedOutput.classList.contains('empty'));

    // Verify round-trip badge
    assert.ok(!verificationBadge.classList.contains('hidden'));
  });

  test('Interactive Element 3: Decrypt Button (#btn-decrypt) Decrypts Directly', () => {
    const plainInput = document.getElementById('plain-input');
    const shiftInput = document.getElementById('shift-input');
    const btnDecrypt = document.getElementById('btn-decrypt');
    const decryptedOutput = document.getElementById('decrypted-output');

    plainInput.value = 'Khoor Zruog!';
    shiftInput.value = '3';

    btnDecrypt.click();

    assert.equal(decryptedOutput.textContent, 'Hello World!');
    assert.ok(!decryptedOutput.classList.contains('empty'));
  });

  test('Interactive Element 4: Swap / Transfer Button (#btn-swap)', () => {
    const btnEncrypt = document.getElementById('btn-encrypt');
    const btnSwap = document.getElementById('btn-swap');
    const plainInput = document.getElementById('plain-input');

    btnEncrypt.click();
    assert.equal(document.getElementById('cipher-output').textContent, 'Khoor Zruog!');

    btnSwap.click();
    assert.equal(plainInput.value, 'Khoor Zruog!', 'Output should be transferred into input console');
  });

  test('Interactive Element 5: Reset Button (#btn-reset) Restores Clean State', () => {
    const btnEncrypt = document.getElementById('btn-encrypt');
    const btnReset = document.getElementById('btn-reset');
    const plainInput = document.getElementById('plain-input');
    const cipherOutput = document.getElementById('cipher-output');
    const decryptedOutput = document.getElementById('decrypted-output');
    const verificationBadge = document.getElementById('verification-badge');

    btnEncrypt.click();
    assert.equal(cipherOutput.textContent, 'Khoor Zruog!');

    btnReset.click();

    assert.equal(plainInput.value, '');
    assert.ok(cipherOutput.classList.contains('empty'));
    assert.ok(decryptedOutput.classList.contains('empty'));
    assert.ok(verificationBadge.classList.contains('hidden'));
  });

  test('Interactive Element 6: Shift Inputs & Slider Synchronization', () => {
    const shiftInput = document.getElementById('shift-input');
    const shiftSlider = document.getElementById('shift-slider');
    const shiftNormBadge = document.getElementById('shift-norm-badge');

    // Change shift input to 7
    shiftInput.value = '7';
    const inputEvent = new window.Event('input');
    shiftInput.dispatchEvent(inputEvent);

    assert.equal(shiftSlider.value, '7');
    assert.ok(shiftNormBadge.textContent.includes('Normalized: 7'));

    // Change via slider to 13
    shiftSlider.value = '13';
    shiftSlider.dispatchEvent(inputEvent);

    assert.equal(shiftInput.value, '13');
    assert.ok(shiftNormBadge.textContent.includes('Normalized: 13'));
  });

  test('Interactive Element 7: Shift Presets (ROT13, Caesar, Negative, Wraparound)', () => {
    const shiftInput = document.getElementById('shift-input');
    const shiftNormBadge = document.getElementById('shift-norm-badge');

    // Click ROT13 Preset
    const rot13Btn = document.querySelector('.btn-shift-preset[data-shift="13"]');
    assert.ok(rot13Btn);
    rot13Btn.click();
    assert.equal(shiftInput.value, '13');

    // Click Shift -1 Preset
    const negBtn = document.querySelector('.btn-shift-preset[data-shift="-1"]');
    assert.ok(negBtn);
    negBtn.click();
    assert.equal(shiftInput.value, '-1');
    assert.ok(shiftNormBadge.textContent.includes('Normalized: 25'));

    // Click Wraparound 29 Preset
    const wrapBtn = document.querySelector('.btn-shift-preset[data-shift="29"]');
    assert.ok(wrapBtn);
    wrapBtn.click();
    assert.equal(shiftInput.value, '29');
    assert.ok(shiftNormBadge.textContent.includes('Normalized: 3'));
  });

  test('Interactive Element 8: Stale Output Warning Detection', () => {
    const btnEncrypt = document.getElementById('btn-encrypt');
    const plainInput = document.getElementById('plain-input');
    const staleWarning = document.getElementById('stale-warning');

    btnEncrypt.click();
    assert.ok(!staleWarning.classList.contains('visible'));

    // User modifies input after encryption
    plainInput.value = 'Hello World! Modified';
    const inputEvent = new window.Event('input');
    plainInput.dispatchEvent(inputEvent);

    // Stale warning should be triggered to prevent misleading results
    assert.ok(staleWarning.classList.contains('visible'), 'Stale warning should be visible after input changes');

    // Re-encrypt clears the stale warning
    btnEncrypt.click();
    assert.ok(!staleWarning.classList.contains('visible'), 'Re-encryption must dismiss stale warning');
  });

  test('Interactive Element 9: Empty Input Validation Error Handling', () => {
    const btnEncrypt = document.getElementById('btn-encrypt');
    const btnReset = document.getElementById('btn-reset');
    const validationMsg = document.getElementById('validation-msg');

    btnReset.click(); // Clears input
    btnEncrypt.click();

    assert.ok(validationMsg.classList.contains('error'));
    assert.ok(validationMsg.textContent.includes('Plaintext input is empty'));
  });

  test('Interactive Element 10: Copy Buttons Clipboard Integration', async () => {
    const btnEncrypt = document.getElementById('btn-encrypt');
    const btnCopyCipher = document.getElementById('btn-copy-cipher');
    const btnCopyDecrypted = document.getElementById('btn-copy-decrypted');
    const toast = document.getElementById('toast');

    btnEncrypt.click();

    btnCopyCipher.click();
    // Allow async clipboard handler to run
    await new Promise(r => setTimeout(r, 10));
    assert.equal(window.__copiedText, 'Khoor Zruog!');
    assert.ok(toast.classList.contains('show'));

    btnCopyDecrypted.click();
    await new Promise(r => setTimeout(r, 10));
    assert.equal(window.__copiedText, 'Hello World!');
  });

  test('Interactive Element 11: Tab Navigation System', () => {
    const tabBtnWorkbench = document.getElementById('tab-btn-workbench');
    const tabBtnCrack = document.getElementById('tab-btn-cryptanalysis');
    const tabBtnEdu = document.getElementById('tab-btn-education');

    const tabWorkbench = document.getElementById('tab-workbench');
    const tabCrack = document.getElementById('tab-cryptanalysis');
    const tabEdu = document.getElementById('tab-education');

    // Switch to Cryptanalysis Tab
    tabBtnCrack.click();
    assert.ok(tabCrack.classList.contains('active'));
    assert.ok(!tabWorkbench.classList.contains('active'));
    assert.equal(tabBtnCrack.getAttribute('aria-selected'), 'true');

    // Switch to Education Tab
    tabBtnEdu.click();
    assert.ok(tabEdu.classList.contains('active'));
    assert.ok(!tabCrack.classList.contains('active'));
    assert.equal(tabBtnEdu.getAttribute('aria-selected'), 'true');

    // Return to Workbench
    tabBtnWorkbench.click();
    assert.ok(tabWorkbench.classList.contains('active'));
    assert.ok(!tabEdu.classList.contains('active'));
  });

  test('Interactive Element 12: Cryptanalysis Lab 25-Key Brute Force Crack', () => {
    const tabBtnCrack = document.getElementById('tab-btn-cryptanalysis');
    const crackInput = document.getElementById('crack-input');
    const btnRunCrack = document.getElementById('btn-run-crack');
    const crackResultsBody = document.getElementById('crack-results-body');

    tabBtnCrack.click();
    crackInput.value = 'Khoor Zruog!'; // Shift 3 of 'Hello World!'

    btnRunCrack.click();

    // Table should contain 25 rows (shifts 1 to 25)
    assert.equal(crackResultsBody.children.length, 25);

    // Top ranked candidate should be shift 3 with 'Hello World!'
    const topRow = crackResultsBody.children[0];
    assert.ok(topRow.classList.contains('top-candidate'));
    assert.ok(topRow.textContent.includes('Shift: 3'));
    assert.ok(topRow.textContent.includes('Hello World!'));
  });
});
