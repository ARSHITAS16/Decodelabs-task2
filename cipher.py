"""
CIPHERGUARD — Python Reference Implementation
DecodeLabs Industrial Training Kit 2026 | Project 2: Basic Encryption & Decryption
"""

from typing import Union, List, Dict, Any
import re

ALPHABET_SIZE = 26
UPPER_BASE = ord('A')
LOWER_BASE = ord('a')


def normalize_shift(shift: Union[int, float, str]) -> int:
    """
    Normalizes any integer shift key to a canonical value in [0, 25].
    """
    if shift is None:
        raise TypeError("Shift key must not be None. Please enter an integer.")

    try:
        if isinstance(shift, float) and not shift.is_integer():
            raise TypeError(f"Invalid shift key {shift}. Shift key must be an integer.")
        num = int(shift)
    except (ValueError, TypeError) as err:
        raise TypeError(f"Invalid shift key '{shift}'. Shift key must be an integer.") from err

    return ((num % ALPHABET_SIZE) + ALPHABET_SIZE) % ALPHABET_SIZE


def caesar_encrypt(plaintext: str, shift: Union[int, str]) -> str:
    """
    Encrypts plaintext using the classical Caesar cipher.
    Preserves case, punctuation, numbers, spaces, and Unicode.
    """
    if plaintext is None:
        return ""
    plaintext = str(plaintext)
    if not plaintext:
        return ""

    k = normalize_shift(shift)
    if k == 0:
        return plaintext

    chars = []
    for char in plaintext:
        code = ord(char)
        if UPPER_BASE <= code <= UPPER_BASE + ALPHABET_SIZE - 1:
            chars.append(chr(((code - UPPER_BASE + k) % ALPHABET_SIZE) + UPPER_BASE))
        elif LOWER_BASE <= code <= LOWER_BASE + ALPHABET_SIZE - 1:
            chars.append(chr(((code - LOWER_BASE + k) % ALPHABET_SIZE) + LOWER_BASE))
        else:
            chars.append(char)

    return "".join(chars)


def caesar_decrypt(ciphertext: str, shift: Union[int, str]) -> str:
    """
    Decrypts ciphertext using the classical Caesar cipher.
    """
    if ciphertext is None:
        return ""
    ciphertext = str(ciphertext)
    if not ciphertext:
        return ""

    k = normalize_shift(shift)
    reverse_shift = (ALPHABET_SIZE - k) % ALPHABET_SIZE
    return caesar_encrypt(ciphertext, reverse_shift)


def round_trip_verify(plaintext: str, shift: Union[int, str]) -> bool:
    """
    Verifies that decrypt(encrypt(plaintext, shift), shift) == plaintext.
    """
    text = "" if plaintext is None else str(plaintext)
    enc = caesar_encrypt(text, shift)
    dec = caesar_decrypt(enc, shift)
    return dec == text


COMMON_WORDS = {
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'hello', 'world', 'secret', 'password', 'cipher', 'message', 'attack', 'key'
}


def brute_force_analyze(ciphertext: str) -> List[Dict[str, Any]]:
    """
    Evaluates all 25 possible non-zero Caesar shifts against a ciphertext.
    """
    if not ciphertext or not ciphertext.strip():
        return []

    results = []
    for s in range(1, ALPHABET_SIZE):
        candidate = caesar_decrypt(ciphertext, s)
        words = re.findall(r'[a-zA-Z]+', candidate.lower())
        matched = [w for w in words if w in COMMON_WORDS]
        score = sum(len(w) * 10 for w in matched)
        results.append({
            "shift": s,
            "decrypted": candidate,
            "score": score,
            "matched_words": matched
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results
