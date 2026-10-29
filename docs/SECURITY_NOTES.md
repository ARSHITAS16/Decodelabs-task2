# SECURITY NOTES: CLASSICAL CIPHERS VS. MODERN CRYPTOGRAPHY
### DecodeLabs Industrial Training Kit 2026 | Project 2: Basic Encryption & Decryption

---

## 1. Executive Summary

This document outlines the theoretical security boundaries, threat model, and historical context of the **Caesar Cipher** implemented in CIPHERGUARD. 

The Caesar cipher is an introductory **monoalphabetic substitution cipher**. While historically notable, it provides **no confidentiality against any modern adversary**.

---

## 2. Mathematical Formalization

Let the English alphabet $\Sigma = \{A, B, C, \dots, Z\}$ be indexed by $\mathbb{Z}_{26} = \{0, 1, 2, \dots, 25\}$ where $A=0, B=1, \dots, Z=25$.

### Encryption Function
For any plaintext character $m \in \mathbb{Z}_{26}$ and key $k \in \mathbb{Z}$:
$$c = E(m, k) = (m + k) \pmod{26}$$

### Decryption Function
For any ciphertext character $c \in \mathbb{Z}_{26}$ and key $k \in \mathbb{Z}$:
$$m = D(c, k) = (c - k) \pmod{26}$$

### Invertibility & Lossless Symmetry
Because modular addition forms an abelian group $(\mathbb{Z}_{26}, +)$:
$$D(E(m, k), k) = ((m + k) - k) \pmod{26} = m \pmod{26} \equiv m$$

---

## 3. Cryptanalysis & Attack Vectors

### A. Brute-Force Exhaustive Key Search
- Total possible keys: $|\mathcal{K}| = 26$.
- Identity key ($k=0$): produces no transformation ($c = m$).
- Effective keyspace: $|\mathcal{K}_{\text{effective}}| = 25$.
- Information entropy: $H(K) = \log_2(25) \approx 4.64\text{ bits}$.
- An attacker testing keys on a modern 3.0 GHz CPU can test all 25 keys in less than 50 nanoseconds.

### B. Statistical Frequency Analysis
In any monoalphabetic substitution, character frequencies are not altered—they are merely shifted:
- English unigram distribution:
  - `E`: 12.7%
  - `T`: 9.1%
  - `A`: 8.2%
  - `O`: 7.5%
  - `I`: 7.0%
- An attacker calculates the frequency distribution $f(c)$ of the ciphertext. The character with the highest frequency almost certainly corresponds to plaintext `E`. The shift is derived immediately:
$$k = (\text{argmax}_c f(c) - \text{ord}('E')) \pmod{26}$$

---

## 4. Kerckhoffs' Principle & Shannon's Maxim

- **Kerckhoffs' Principle (1883):** *"A cryptosystem should be secure even if everything about the system, except the key, is public knowledge."*
- **Shannon's Maxim (1949):** *"The enemy knows the system."*

In modern cryptography, security must rely entirely on the secrecy and entropy of the key, never on the secrecy of the algorithm. 
The Caesar cipher fails Kerckhoffs' Principle because once an adversary knows the algorithm is a Caesar cipher, the small key space ensures instantaneous recovery of the plaintext.

---

## 5. Comparison Matrix: Classical vs. Modern Cryptography

| Dimension | Caesar Cipher (Project 2) | Advanced Encryption Standard (AES-256) |
|---|---|---|
| **Era** | Classical Antiquity (~58 BC) | Modern Standard (NIST FIPS 197, 2001) |
| **Key Size** | 4.64 bits (25 keys) | 256 bits ($1.15 \times 10^{77}$ keys) |
| **Block Size** | 1 Character (Stream) | 128 Bits (16 Bytes) |
| **Operation Type** | Modular Character Shift | SPN: SubBytes, ShiftRows, MixColumns, AddRoundKey |
| **Cryptanalysis Resistance**| Trivial (Brute force & frequency) | Proven secure against known quantum & classical attacks |
| **Confidentiality Level** | Zero (Educational Only) | Top Secret / Military Grade |
| **Integrity / Auth** | None (Malleable) | Authenticated (AES-GCM / Poly1305) |

---

## 6. Implementation Privacy Guarantees

1. **Zero Network Egress:** All encryption, decryption, and frequency analysis execute entirely within the client's local runtime. No data is transmitted to remote servers.
2. **In-Memory Volatility:** Candidate plaintexts are not cached in persistent browser storage (`localStorage` or `IndexedDB`).
3. **Safe Glyph Invariance:** Non-English characters are never corrupted, stripped, or converted into replacement glyphs (`?` or `\uFFFD`).
