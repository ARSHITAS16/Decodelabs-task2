/**
 * CIPHERGUARD — Interactive UI Controller & Event Handlers
 * DecodeLabs Industrial Training Kit 2026 | Project 2: Basic Encryption & Decryption
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Core Cipher Module
  const cipher = window.CipherGuard;

  // DOM Elements: Navigation
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // DOM Elements: Inputs
  const plainInput = document.getElementById('plain-input');
  const shiftInput = document.getElementById('shift-input');
  const shiftSlider = document.getElementById('shift-slider');
  const shiftNormBadge = document.getElementById('shift-norm-badge');
  const charCounter = document.getElementById('char-counter');
  const validationMsg = document.getElementById('validation-msg');
  const staleWarning = document.getElementById('stale-warning');

  // DOM Elements: Alphabet Ribbon
  const alphabetGrid = document.getElementById('alphabet-grid');

  // DOM Elements: Buttons
  const btnEncrypt = document.getElementById('btn-encrypt');
  const btnDecrypt = document.getElementById('btn-decrypt');
  const btnSwap = document.getElementById('btn-swap');
  const btnReset = document.getElementById('btn-reset');
  const btnCopyCipher = document.getElementById('btn-copy-cipher');
  const btnCopyDecrypted = document.getElementById('btn-copy-decrypted');

  // DOM Elements: Output Panels
  const cipherOutputBox = document.getElementById('cipher-output');
  const decryptedOutputBox = document.getElementById('decrypted-output');
  const cipherMetrics = document.getElementById('cipher-metrics');
  const decryptedMetrics = document.getElementById('decrypted-metrics');
  const verificationBadge = document.getElementById('verification-badge');

  // DOM Elements: Cryptanalysis Lab
  const crackInput = document.getElementById('crack-input');
  const btnRunCrack = document.getElementById('btn-run-crack');
  const crackResultsTable = document.getElementById('crack-results-body');
  const crackStatus = document.getElementById('crack-status');

  // DOM Elements: Toast
  const toast = document.getElementById('toast');

  // State
  let lastEncryptedInput = '';
  let lastEncryptedShift = null;

  /* -------------------------------------------------------------------------- */
  /* TAB NAVIGATION                                                             */
  /* -------------------------------------------------------------------------- */
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      
      const targetTab = document.getElementById(targetId);
      if (targetTab) {
        targetTab.classList.add('active');
      }

      // If switching to Cryptanalysis and we have ciphertext, prepopulate
      if (targetId === 'tab-cryptanalysis' && crackInput && !crackInput.value) {
        const currentCipher = cipherOutputBox.textContent;
        if (currentCipher && !cipherOutputBox.classList.contains('empty')) {
          crackInput.value = currentCipher;
        }
      }
    });
  });

  /* -------------------------------------------------------------------------- */
  /* SHIFT SYNCHRONIZATION & VISUAL ALPHABET RIBBON                             */
  /* -------------------------------------------------------------------------- */
  function updateShift(val) {
    try {
      const normalized = cipher.normalizeShift(val);
      
      // Keep inputs in sync
      shiftInput.value = val;
      // Slider stays within [0, 25]
      shiftSlider.value = normalized;

      // Update normalization readout badge
      shiftNormBadge.textContent = `Raw: ${val} → Normalized: ${normalized} (Shift +${normalized} positions)`;
      clearValidationError();

      // Render alphabet strip
      renderAlphabetRibbon(normalized);

      // Check for stale output
      checkStaleOutput();
    } catch (err) {
      showValidationError(err.message);
    }
  }

  function renderAlphabetRibbon(shift) {
    if (!alphabetGrid) return;
    const table = cipher.getShiftTable(shift);
    alphabetGrid.innerHTML = '';

    for (let i = 0; i < 26; i++) {
      const plainDiv = document.createElement('div');
      plainDiv.className = 'alpha-cell plain';
      plainDiv.textContent = table.plainUpper[i];
      plainDiv.title = `Plaintext letter: ${table.plainUpper[i]}`;

      const cipherDiv = document.createElement('div');
      cipherDiv.className = 'alpha-cell cipher';
      cipherDiv.textContent = table.cipherUpper[i];
      cipherDiv.title = `Encrypted letter with shift ${shift}: ${table.cipherUpper[i]}`;

      alphabetGrid.appendChild(plainDiv);
      alphabetGrid.appendChild(cipherDiv);
    }
  }

  shiftInput.addEventListener('input', (e) => {
    updateShift(e.target.value);
  });

  shiftSlider.addEventListener('input', (e) => {
    updateShift(parseInt(e.target.value, 10));
  });

  // Preset Shift Buttons
  document.querySelectorAll('.btn-shift-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetShift = parseInt(btn.getAttribute('data-shift'), 10);
      updateShift(presetShift);
    });
  });

  // Sample Text Buttons
  document.querySelectorAll('.btn-sample').forEach(btn => {
    btn.addEventListener('click', () => {
      const sampleText = btn.getAttribute('data-sample');
      plainInput.value = sampleText;
      updateCharCount();
      checkStaleOutput();
    });
  });

  /* -------------------------------------------------------------------------- */
  /* INPUT MONITORING & STALE OUTPUT HANDLING                                   */
  /* -------------------------------------------------------------------------- */
  function updateCharCount() {
    const len = plainInput.value.length;
    charCounter.textContent = `${len} character${len === 1 ? '' : 's'}`;
  }

  function checkStaleOutput() {
    if (!lastEncryptedInput && lastEncryptedShift === null) {
      staleWarning.classList.remove('visible');
      return;
    }

    const currentShift = parseInt(shiftInput.value, 10);
    const hasChanged = plainInput.value !== lastEncryptedInput || currentShift !== lastEncryptedShift;

    if (hasChanged && !cipherOutputBox.classList.contains('empty')) {
      staleWarning.classList.add('visible');
    } else {
      staleWarning.classList.remove('visible');
    }
  }

  plainInput.addEventListener('input', () => {
    updateCharCount();
    checkStaleOutput();
    clearValidationError();
  });

  /* -------------------------------------------------------------------------- */
  /* VALIDATION HELPERS                                                         */
  /* -------------------------------------------------------------------------- */
  function showValidationError(msg) {
    validationMsg.textContent = `⚠️ ${msg}`;
    validationMsg.className = 'validation-msg error';
  }

  function clearValidationError() {
    validationMsg.textContent = '';
    validationMsg.className = 'validation-msg';
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  /* -------------------------------------------------------------------------- */
  /* ENCRYPTION ACTION                                                          */
  /* -------------------------------------------------------------------------- */
  btnEncrypt.addEventListener('click', () => {
    clearValidationError();

    const text = plainInput.value;
    const shiftVal = shiftInput.value;

    if (text.length === 0) {
      showValidationError('Plaintext input is empty. Please enter text to encrypt.');
      plainInput.focus();
      return;
    }

    try {
      const shiftNum = cipher.normalizeShift(shiftVal);
      const ciphertext = cipher.caesarEncrypt(text, shiftNum);
      const decrypted = cipher.caesarDecrypt(ciphertext, shiftNum);

      // Display ciphertext
      cipherOutputBox.textContent = ciphertext;
      cipherOutputBox.classList.remove('empty');
      cipherMetrics.textContent = `${ciphertext.length} chars | Shift: +${shiftNum}`;

      // Display decrypted verification
      decryptedOutputBox.textContent = decrypted;
      decryptedOutputBox.classList.remove('empty');
      decryptedMetrics.textContent = `${decrypted.length} chars | Key: -${shiftNum}`;

      // Verify Round-Trip Invariant
      const isVerified = (decrypted === text);
      if (isVerified) {
        verificationBadge.classList.remove('hidden');
      } else {
        verificationBadge.classList.add('hidden');
      }

      // Record state for stale detection
      lastEncryptedInput = text;
      lastEncryptedShift = parseInt(shiftVal, 10);
      staleWarning.classList.remove('visible');

      showToast('Encryption complete! Results ready.');
    } catch (err) {
      showValidationError(err.message);
    }
  });

  /* -------------------------------------------------------------------------- */
  /* DECRYPTION ACTION                                                          */
  /* -------------------------------------------------------------------------- */
  btnDecrypt.addEventListener('click', () => {
    clearValidationError();

    const text = plainInput.value;
    const shiftVal = shiftInput.value;

    if (text.length === 0) {
      showValidationError('Input is empty. Please enter ciphertext in the input box to decrypt.');
      plainInput.focus();
      return;
    }

    try {
      const shiftNum = cipher.normalizeShift(shiftVal);
      const decrypted = cipher.caesarDecrypt(text, shiftNum);

      // Decrypted output panel
      decryptedOutputBox.textContent = decrypted;
      decryptedOutputBox.classList.remove('empty');
      decryptedMetrics.textContent = `${decrypted.length} chars | Shift: -${shiftNum}`;

      // Record state
      lastEncryptedInput = text;
      lastEncryptedShift = parseInt(shiftVal, 10);
      staleWarning.classList.remove('visible');

      showToast('Decryption complete! Plaintext restored.');
    } catch (err) {
      showValidationError(err.message);
    }
  });

  /* -------------------------------------------------------------------------- */
  /* SWAP / TRANSFER ACTION                                                     */
  /* -------------------------------------------------------------------------- */
  btnSwap.addEventListener('click', () => {
    const currentCipher = cipherOutputBox.textContent;
    if (!currentCipher || cipherOutputBox.classList.contains('empty')) {
      showValidationError('No ciphertext available to transfer. Please encrypt some text first.');
      return;
    }

    plainInput.value = currentCipher;
    updateCharCount();
    checkStaleOutput();
    showToast('Ciphertext transferred to input console!');
  });

  /* -------------------------------------------------------------------------- */
  /* RESET / CLEAR ACTION                                                       */
  /* -------------------------------------------------------------------------- */
  btnReset.addEventListener('click', () => {
    plainInput.value = '';
    updateCharCount();
    updateShift(3);

    cipherOutputBox.textContent = 'Encrypted ciphertext will appear here...';
    cipherOutputBox.classList.add('empty');
    cipherMetrics.textContent = '0 chars';

    decryptedOutputBox.textContent = 'Decrypted verification plaintext will appear here...';
    decryptedOutputBox.classList.add('empty');
    decryptedMetrics.textContent = '0 chars';

    verificationBadge.classList.add('hidden');
    staleWarning.classList.remove('visible');
    clearValidationError();

    lastEncryptedInput = '';
    lastEncryptedShift = null;

    showToast('Workbench reset to default initial state.');
  });

  /* -------------------------------------------------------------------------- */
  /* CLIPBOARD COPY HANDLERS                                                    */
  /* -------------------------------------------------------------------------- */
  async function copyToClipboard(element, label) {
    if (element.classList.contains('empty') || !element.textContent.trim()) {
      showToast('⚠️ Nothing to copy!');
      return;
    }

    const textToCopy = element.textContent;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for non-secure / local contexts
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = textToCopy;
        tempTextarea.style.position = 'fixed';
        tempTextarea.style.opacity = '0';
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextarea);
      }
      showToast(`✓ ${label} copied to clipboard!`);
    } catch (err) {
      showToast('⚠️ Clipboard copy failed.');
    }
  }

  btnCopyCipher.addEventListener('click', () => {
    copyToClipboard(cipherOutputBox, 'Ciphertext');
  });

  btnCopyDecrypted.addEventListener('click', () => {
    copyToClipboard(decryptedOutputBox, 'Decrypted text');
  });

  /* -------------------------------------------------------------------------- */
  /* BRUTE-FORCE / CRYPTANALYSIS LAB ACTION                                     */
  /* -------------------------------------------------------------------------- */
  btnRunCrack.addEventListener('click', () => {
    const text = crackInput.value;
    if (!text || text.trim().length === 0) {
      showToast('⚠️ Please enter or transfer ciphertext to analyze!');
      crackInput.focus();
      return;
    }

    crackStatus.textContent = 'Evaluating all 25 potential shift keys against English dictionary and frequency distributions...';
    
    // Execute brute-force analysis
    const results = cipher.bruteForceAnalyze(text);
    crackResultsTable.innerHTML = '';

    if (results.length === 0) {
      crackStatus.textContent = 'No alphabetic characters found to analyze.';
      return;
    }

    results.forEach((row, idx) => {
      const tr = document.createElement('tr');
      if (idx === 0) {
        tr.className = 'top-candidate';
      }

      const tdRank = document.createElement('td');
      tdRank.textContent = `#${idx + 1}` + (idx === 0 ? ' (Likely Match 🎯)' : '');

      const tdShift = document.createElement('td');
      tdShift.textContent = `Shift: ${row.shift} (Key: -${row.shift})`;

      const tdScore = document.createElement('td');
      tdScore.textContent = `${row.score} pts`;

      const tdWords = document.createElement('td');
      tdWords.textContent = row.matchedWords.length > 0 ? row.matchedWords.slice(0, 5).join(', ') : '—';

      const tdText = document.createElement('td');
      tdText.textContent = row.decrypted;

      const tdAction = document.createElement('td');
      const loadBtn = document.createElement('button');
      loadBtn.className = 'btn btn-secondary btn-icon-only';
      loadBtn.textContent = 'Load in Workbench';
      loadBtn.title = `Load shift ${row.shift} and this plaintext into Workbench`;
      loadBtn.addEventListener('click', () => {
        // Switch to Workbench
        document.querySelector('[data-tab="tab-workbench"]').click();
        plainInput.value = row.decrypted;
        updateCharCount();
        updateShift(row.shift);
        btnEncrypt.click();
      });
      tdAction.appendChild(loadBtn);

      tr.appendChild(tdRank);
      tr.appendChild(tdShift);
      tr.appendChild(tdScore);
      tr.appendChild(tdWords);
      tr.appendChild(tdText);
      tr.appendChild(tdAction);

      crackResultsTable.appendChild(tr);
    });

    crackStatus.textContent = `Completed evaluation: 25 keys tested. Top candidate identified with shift ${results[0].shift} (Score: ${results[0].score}).`;
  });

  // Pre-load default example
  plainInput.value = 'Hello World!';
  updateCharCount();
  updateShift(3);
  renderAlphabetRibbon(3);
});
