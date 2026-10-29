# CIPHERGUARD — Classical Encryption & Decryption Workbench
### DecodeLabs Industrial Training Kit 2026 | Project 2: Basic Encryption & Decryption

> *"Shift the perspective. Reveal the mechanism. Understand confidentiality."*

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Python Version](https://img.shields.io/badge/python-3.10%20%7C%203.11%20%7C%203.12%20%7C%203.14-blue.svg)](https://www.python.org/)
[![Tests](https://img.shields.io/badge/tests-42%20passed%20(100%25)-brightgreen.svg)]()
[![Privacy](https://img.shields.io/badge/privacy-100%25%20local--first-blueviolet.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()

---

## 1. Executive Summary & Project Purpose

**CIPHERGUARD** is a defensive cybersecurity and introductory cryptography workbench engineered for **Project 2: Basic Encryption & Decryption** in the DecodeLabs Industrial Training Kit (Batch 2026).

While modern computer systems rely on cryptosystems with astronomically large keyspaces (e.g. AES-256 with $2^{256}$ keys), mastering modern information security requires first understanding the foundational mechanics of:
1. **Reversible Mathematical Transformations:** How an invertible mathematical mapping encrypts plaintext into ciphertext and restores original data with exact parity.
2. **Key-Dependent Confusion:** How a user-controlled parameter (the shift key) alters output state deterministically.
3. **Introductory Data Confidentiality:** Distinguishing between cosmetic obfuscation and true cryptographic security.
4. **The Vulnerability of Small Key Spaces:** Demonstrating hands-on why classical monoalphabetic substitution ciphers provide zero modern protection against brute-force and frequency analysis attacks.

---

## 2. Learning Objectives & Core Requirements

CIPHERGUARD satisfies all mandatory requirements and learning objectives:

- **Configurable Shift Key:** Accepts any arbitrary integer key $k \in \mathbb{Z}$, mathematically normalizing it to the canonical range $[0, 25]$ using modulo arithmetic: $k_{\text{norm}} = ((k \pmod{26}) + 26) \pmod{26}$.
- **Case & Glyph Preservation:** Shifts English uppercase letters (`A-Z`) and lowercase letters (`a-z`) independently. All spaces, punctuation, numeric digits, and international Unicode code points (Cyrillic, accented vowels, emojis) pass through pristine.
- **Decryption & Reversibility:** Implements the exact inverse transformation $D(C, k) = E(C, -k)$, mathematically proving that $\text{decrypt}(\text{encrypt}(M, k), k) \equiv M$.
- **Dual Output Panels:** Simultaneously displays both the encrypted ciphertext and the independent decrypted verification result to confirm lossless data integrity.
- **Stale Output Detection:** Automatically flags outputs as modified if the user edits the input text or shift key after generation, preventing misleading states.
- **Exhaustive 25-Key Cryptanalysis Lab:** Evaluates all 25 non-zero shifts simultaneously and ranks candidate decryptions using English letter frequency heuristics and dictionary matching.

---

## 3. Project Architecture & File Structure

```
cipherguard/
├── index.html                 # Semantic HTML5 workbench with accessibility & ARIA
├── package.json               # Scripts: test (Node test runner) and start
├── server.js                  # Zero-dependency local static server (Node.js http)
├── cipher.py                  # Python reference implementation
├── README.md                  # Comprehensive documentation & testing audit
├── css/
│   └── style.css              # Cyber dark theme, glassmorphic panels, responsive grid
├── js/
│   ├── cipher.js              # Pure deterministic cipher engine (ESM + CommonJS)
│   └── app.js                 # Interactive DOM controller, visual ribbon, clipboard
├── docs/
│   └── SECURITY_NOTES.md      # Classical vs modern cryptography & Kerckhoffs' principle
└── tests/
    ├── cipher.test.js         # Phase 5 mandatory unit tests (16 tests)
    ├── dom.test.js            # Phase 4 & 8 interactive DOM element tests (12 tests)
    └── test_cipher.py         # Cross-runtime Pytest suite (14 tests)
```

---

## 4. Key Workbench Capabilities

### 🔐 Interactive Workbench Console
- **Input Text Area:** Monospaced candidate input area with live character counting and quick-load sample buttons (`Hello World!`, `ABCXYZ`, `DecodeLabs 2026`, and Unicode test strings).
- **Shift Key Controls:** Direct integer input synchronized in real time with a 0–25 position slider, raw-to-normalized badge, and quick presets (`Caesar Classic (3)`, `ROT13 (13)`, `Reverse (-1)`, `Wraparound (29)`, `Identity (0)`).
- **Visual Alphabet Shift Ribbon:** Displays the 26 English letters aligned with their shifted counterparts, visually demonstrating the substitution mapping on every key adjustment.
- **Action Buttons:** `Encrypt Text`, `Decrypt Text`, `Use Output as Input` (for round-trip verification), and `Reset / Clear` (restoring initial defaults).

### 📊 Dual Output & Verification Panels
- **Ciphertext Output:** Displays generated ciphertext with one-click clipboard copy (`navigator.clipboard` with legacy fallback) and toast confirmation.
- **Decrypted Verification Panel:** Shows decrypted plaintext output with character counts and mathematical rule trace.
- **Lossless Invariant Badge:** Dynamically verifies that $D(E(M, k), k) = M$ upon every encryption.
- **Stale State Sentinel:** Warns the user if inputs or keys have changed since the last execution.

### ⚡ Brute-Force & Cryptanalysis Lab
- Demonstrates why the Caesar cipher has no place in modern security.
- Tests all 25 non-zero shifts in &lt; 1 millisecond.
- Evaluates candidate plaintexts using English letter frequencies (ETAOIN SHRDLU) and common dictionary words, automatically ranking the most probable key.
- Includes a direct "Load in Workbench" button on every candidate row.

---

## 5. Local Setup & Execution Commands

### Prerequisites
- Node.js v20+ (Tested on Node.js v24.19.0)
- Python 3.10+ (Tested on Python 3.14.4)

### Running the Application

```bash
# Navigate to project directory
cd C:\Users\ARSHITA\.gemini\antigravity-ide\scratch\cipherguard

# Launch the local server
npm start
# OR: node server.js
```

Open your browser at **`http://localhost:3000`**.

### Running Automated Tests

```bash
# Run complete Node.js test suite (Unit tests + DOM interactive element tests)
npm test

# Run cross-runtime Python Pytest suite
python -m pytest tests/ -v
```

---

## 6. Automated Test Suite Results

### A. Node.js Test Suite (28 Tests Passed)
```
▶ PHASE 5: MANDATORY CIPHER CORRECTNESS VERIFICATION
  ✔ Test 1: Basic encryption (ABC + 3 -> DEF)
  ✔ Test 2: Alphabet wraparound (XYZ + 3 -> ABC)
  ✔ Test 3: Mixed case and punctuation (Hello World! + 3 -> Khoor Zruog!)
  ✔ Test 4: Decryption (Khoor Zruog! + 3 -> Hello World!)
  ✔ Test 5: Zero shift (Hello + 0 -> Hello)
  ✔ Test 6: Shift larger than alphabet length (ABC + 29 -> DEF)
  ✔ Test 7: Negative shift (ABC + -1 -> ZAB)
  ✔ Test 8: Non-alphabetic characters (123 !@# + 5 -> 123 !@#)
  ✔ Test 9: Round-trip property decrypt(encrypt(plaintext, shift), shift) === plaintext
  ✔ Test 10: Unicode preservation outside English alphabet
  ✔ Test 11: Empty input and whitespace handling
  ✔ Test 12: Invalid shift key handling (throws descriptive TypeError)
✔ PHASE 5: MANDATORY CIPHER CORRECTNESS VERIFICATION

▶ ADDITIONAL CRYPTOGRAPHIC & LAB INVARIANTS
  ✔ Shift normalization handles large multiples of 26
  ✔ ROT13 symmetric self-inverse property
  ✔ Shift table generator provides 26-element mapping
  ✔ Brute force frequency analysis ranks likely shift highest for English plaintext
✔ ADDITIONAL CRYPTOGRAPHIC & LAB INVARIANTS

▶ PHASE 4 & 8: INTERACTIVE ELEMENT & UI WORKFLOW AUDIT
  ✔ Interactive Element 1: Initial State & DOM Elements Mount Correctly
  ✔ Interactive Element 2: Encrypt Button (#btn-encrypt) Transforms Plaintext
  ✔ Interactive Element 3: Decrypt Button (#btn-decrypt) Decrypts Directly
  ✔ Interactive Element 4: Swap / Transfer Button (#btn-swap)
  ✔ Interactive Element 5: Reset Button (#btn-reset) Restores Clean State
  ✔ Interactive Element 6: Shift Inputs & Slider Synchronization
  ✔ Interactive Element 7: Shift Presets (ROT13, Caesar, Negative, Wraparound)
  ✔ Interactive Element 8: Stale Output Warning Detection
  ✔ Interactive Element 9: Empty Input Validation Error Handling
  ✔ Interactive Element 10: Copy Buttons Clipboard Integration
  ✔ Interactive Element 11: Tab Navigation System
  ✔ Interactive Element 12: Cryptanalysis Lab 25-Key Brute Force Crack
✔ PHASE 4 & 8: INTERACTIVE ELEMENT & UI WORKFLOW AUDIT

ℹ tests 28 | pass 28 | fail 0
```

### B. Python Pytest Suite (14 Tests Passed)
```
tests/test_cipher.py::test_1_basic_encryption PASSED
tests/test_cipher.py::test_2_alphabet_wraparound PASSED
tests/test_cipher.py::test_3_mixed_case_and_punctuation PASSED
tests/test_cipher.py::test_4_decryption PASSED
tests/test_cipher.py::test_5_zero_shift PASSED
tests/test_cipher.py::test_6_shift_larger_than_alphabet PASSED
tests/test_cipher.py::test_7_negative_shift PASSED
tests/test_cipher.py::test_8_non_alphabetic_characters PASSED
tests/test_cipher.py::test_9_round_trip_property PASSED
tests/test_cipher.py::test_10_unicode_preservation PASSED
tests/test_cipher.py::test_11_empty_input_handling PASSED
tests/test_cipher.py::test_12_invalid_key_handling PASSED
tests/test_cipher.py::test_rot13_symmetric_property PASSED
tests/test_cipher.py::test_brute_force_analyze PASSED

============================= 14 passed in 0.09s ==============================
```

---

## 7. Security Realities & Cryptographic Limitations

1. **Tiny Key Space:** With only 25 non-trivial keys ($k \in [1, 25]$), an adversary testing keys sequentially will find the correct message in an average of 13 attempts (under 10 microseconds on standard CPU).
2. **Frequency Analysis Vulnerability:** Monoalphabetic ciphers have a 1-to-1 letter mapping. The statistical distribution of English letters is preserved directly in the ciphertext.
3. **No Integrity or Authenticity:** Classical ciphers do not provide message authentication codes (MAC) or tamper detection. An adversary can modify ciphertext characters without detection.
4. **Modern Alternatives:** Real-world data confidentiality requires authenticated symmetric ciphers such as **AES-256-GCM** or **ChaCha20-Poly1305**, combined with asymmetric key exchange (**ECDH / X25519**) and robust key derivation functions (**Argon2id / PBKDF2**).

---

## 8. Manual Testing Checklist for Evaluators

Follow this step-by-step checklist in the running browser at `http://localhost:3000`:

| Step | Action | Expected Result | Status |
|---|---|---|---|
| 1 | Open `http://localhost:3000` | Application loads with header, tabs, and default sample `"Hello World!"` with shift `3`. | PASS |
| 2 | Click **Encrypt Text** | Ciphertext displays `"Khoor Zruog!"`, Decrypted displays `"Hello World!"`, Round-trip badge shows verified. | PASS |
| 3 | Click **Copy Ciphertext** | Toast displays *"Ciphertext copied to clipboard!"*; clipboard contains `"Khoor Zruog!"`. | PASS |
| 4 | Click **Use Output as Input** | Input textarea is populated with `"Khoor Zruog!"`. | PASS |
| 5 | Click **Decrypt Text** | Decrypted panel shows `"Hello World!"`. | PASS |
| 6 | Select sample **ABCXYZ (Wraparound)** | Input becomes `"ABCXYZ"`. | PASS |
| 7 | Click **Encrypt Text** (Shift 3) | Ciphertext displays `"DEFABC"`, demonstrating alphabet wraparound (`X->A, Y->B, Z->C`). | PASS |
| 8 | Click preset **Shift 13 (ROT13)** | Shift updates to 13. Alphabet ribbon re-aligns to A ➔ N. | PASS |
| 9 | Click **Encrypt Text** | Ciphertext becomes `"NOPKLM"`. Click Encrypt again to demonstrate self-inverse symmetry. | PASS |
| 10 | Enter shift `-1` in numeric box | Normalized readout displays `Raw: -1 → Normalized: 25`. | PASS |
| 11 | Enter shift `29` in numeric box | Normalized readout displays `Raw: 29 → Normalized: 3`. | PASS |
| 12 | Test mixed text with symbols & Unicode | Enter `"DecodeLabs 2026: 🛡️ Cyrillic Привет, café 100%!"`. Numbers, punctuation, emojis, and Cyrillic remain intact. | PASS |
| 13 | Click **Reset / Clear** | Input, output panels, and verification badges are cleared; shift resets to `3`. | PASS |
| 14 | Click **Encrypt Text** with empty input | Red alert appears: *"Plaintext input is empty. Please enter text to encrypt."* | PASS |
| 15 | Switch to **Brute-Force & Cryptanalysis Lab** tab | Tab 2 activates. Intercepted ciphertext is pre-loaded or ready for input. | PASS |
| 16 | Click **Execute 25-Key Exhaustive Search** | Table renders 25 candidate rows. The top match is highlighted in green with high confidence score. | PASS |
| 17 | Click **Load in Workbench** on candidate row | Switches back to Workbench tab, loads candidate and key, and executes encryption. | PASS |
| 18 | Check Browser Console (`F12`) | Zero errors, zero warnings, zero uncaught exceptions. | PASS |
