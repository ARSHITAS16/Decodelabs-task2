"""
CIPHERGUARD — Pytest Verification Suite
DecodeLabs Industrial Training Kit 2026 | Project 2: Basic Encryption & Decryption
"""

import pytest
from cipher import (
    normalize_shift,
    caesar_encrypt,
    caesar_decrypt,
    round_trip_verify,
    brute_force_analyze,
)


def test_1_basic_encryption():
    assert caesar_encrypt("ABC", 3) == "DEF"


def test_2_alphabet_wraparound():
    assert caesar_encrypt("XYZ", 3) == "ABC"


def test_3_mixed_case_and_punctuation():
    assert caesar_encrypt("Hello World!", 3) == "Khoor Zruog!"


def test_4_decryption():
    assert caesar_decrypt("Khoor Zruog!", 3) == "Hello World!"


def test_5_zero_shift():
    assert caesar_encrypt("Hello", 0) == "Hello"
    assert caesar_decrypt("Hello", 0) == "Hello"


def test_6_shift_larger_than_alphabet():
    assert caesar_encrypt("ABC", 29) == "DEF"


def test_7_negative_shift():
    assert caesar_encrypt("ABC", -1) == "ZAB"


def test_8_non_alphabetic_characters():
    assert caesar_encrypt("123 !@#", 5) == "123 !@#"


def test_9_round_trip_property():
    samples = [
        ("The quick brown fox jumps over the lazy dog.", 3),
        ("DecodeLabs Industrial Cybersecurity Kit 2026!", 13),
        ("A", 1),
        ("Z", 25),
        ("EdgeCase123$#@\n\tMultiLine", 7),
        ("NegativeShiftTest", -5),
        ("MassiveShiftTest", 52003),
        ("SpecialUnicode: 🛡️ Cyrillic Привет, Français Résumé", 4),
    ]
    for text, shift in samples:
        assert round_trip_verify(text, shift) is True
        enc = caesar_encrypt(text, shift)
        dec = caesar_decrypt(enc, shift)
        assert dec == text


def test_10_unicode_preservation():
    text = "Русский текст, café crème, emoji 🔐🛡️🚀, symbols π ≈ 3.14"
    enc = caesar_encrypt(text, 3)
    assert "Русский текст" in enc
    assert "é" in enc
    assert "è" in enc
    assert "🔐🛡️🚀" in enc
    assert "π ≈ 3.14" in enc
    assert caesar_decrypt(enc, 3) == text


def test_11_empty_input_handling():
    assert caesar_encrypt("", 3) == ""
    assert caesar_decrypt("", 3) == ""
    assert caesar_encrypt(None, 3) == ""
    assert caesar_decrypt(None, 3) == ""
    assert caesar_encrypt("   ", 3) == "   "


def test_12_invalid_key_handling():
    invalid_keys = ["abc", 3.14, None, ""]
    for key in invalid_keys:
        with pytest.raises(TypeError):
            normalize_shift(key)


def test_rot13_symmetric_property():
    text = "DecodeLabs Cyber Security Project 2"
    assert caesar_encrypt(caesar_encrypt(text, 13), 13) == text


def test_brute_force_analyze():
    secret = "The secret password to access the server is confidential."
    ct = caesar_encrypt(secret, 7)
    candidates = brute_force_analyze(ct)
    assert len(candidates) == 25
    assert candidates[0]["shift"] == 7
    assert candidates[0]["decrypted"] == secret
