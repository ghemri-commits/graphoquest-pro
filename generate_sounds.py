import os
import time
from gtts import gTTS

def generate_audio(text, lang, filename):
    filepath = f"sounds/{filename}.mp3"
    try:
        tts = gTTS(text=text, lang=lang, slow=False)
        tts.save(filepath)
        print(f"OK : {filepath}")
        time.sleep(0.5)
    except Exception as e:
        print(f"ERREUR {filename}: {e}")

if not os.path.exists("sounds"):
    os.makedirs("sounds")

print("Génération des fichiers audio...")

# ==========================================
# FRANÇAIS
# ==========================================

fr_phonemes = {
    "a": "a", "e": "e", "i": "i", "o": "o", "u": "u", "y": "i", "é": "é",
    "ou": "ou", "on": "on", "an": "an", "in": "in", "au": "au", "oi": "oi",
    "eau": "au", "eu": "eu", "im": "in", "ei": "è", "en": "an",
    "m": "mmmm", "n": "nnnn", "l": "llll", "r": "rrrr", "s": "ssss",
    "z": "zzzz", "f": "ffff", "v": "vvvv", "j": "jjjj",
    "ch": "chchch", "sh": "chchch", "ph": "ffff", "gn": "ni", "ni": "ni", "nj": "nji",
    "p": "p", "b": "b", "t": "t", "d": "d", "c": "k", "k": "k", "q": "k", "g": "gue",
    "br": "br", "pr": "pr", "dr": "dr", "vr": "vr", "cl": "kl", "gl": "gl",
    "fl": "fl", "pl": "pl", "fr": "fr", "phr": "fr", "cr": "kr", "tr": "tr"
}

for filename, text in fr_phonemes.items():
    generate_audio(text, 'fr', f"fr_{filename}")

fr_syllables = [
    "be", "bi", "bette", "ca", "che", "cha", "chau", "cho", "co", "cro",
    "da", "de", "di", "do", "fa", "fan", "fi", "ga", "gne", "gro", "guane",
    "ja", "je", "ju", "la", "le", "lu", "lé", "lle", "ma", "man", "mar",
    "mon", "na", "nas", "nard", "ne", "nie", "no", "nu", "pa", "pan", "pe",
    "peau", "pette", "pin", "pluie", "plou", "po", "pu", "ra", "rage", "re",
    "ro", "sa", "saure", "seau", "so", "ssure", "sure", "ta", "to", "trom",
    "tron", "va", "vi", "za"
]

for syl in fr_syllables:
    generate_audio(syl, 'fr', f"fr_{syl}")

# ==========================================
# ANGLAIS
# ==========================================

en_phonemes = {
    "a": "a", "e": "e", "i": "i", "o": "o", "u": "uh",
    "m": "mmmm", "n": "nnnn", "w": "www", "l": "llll", "s": "ssss",
    "c": "k", "z": "zzzz", "f": "ffff", "v": "vvvv", "ph": "ffff",
    "t": "t", "p": "p", "b": "b", "d": "d", "q": "kw", "k": "k", "g": "g",
    "sh": "shsh", "ch": "ch", "th": "th", "tch": "ch",
    "ee": "ee", "ea": "ee", "ie": "ee", "oa": "oh", "ow": "ow",
    "oe": "oh", "oo": "oo", "ew": "oo", "ou": "ou",
    "ar": "ar", "er": "er", "or": "or", "ur": "er", "our": "our",
    "bl": "bl", "pl": "pl", "cl": "cl", "gl": "gl", "tr": "tr",
    "dr": "dr", "pr": "pr", "cr": "cr", "br": "br", "gr": "gr"
}

for filename, text in en_phonemes.items():
    generate_audio(text, 'en', f"en_{filename}")

en_syllables = [
    "ab", "al", "ap", "bea", "bee", "blan", "boat", "bot", "cam", "cat",
    "chick", "choo", "cil", "com", "dar", "der", "din", "dir", "el", "en",
    "fan", "far", "fer", "flo", "flow", "fun", "ga", "ger", "ic", "ig",
    "in", "jer", "kan", "ket", "ki", "loo", "lou", "man", "mar", "men",
    "mer", "mon", "pan", "pe", "pen", "phant", "plan", "ple", "prac",
    "roo", "ru", "sel", "shick", "shoo", "spa", "spi", "tai", "tel", "ter",
    "thun", "ti", "ting", "tle", "tor", "trac"
]

for syl in en_syllables:
    generate_audio(syl, 'en', f"en_{syl}")

print(f"\nTerminé ! {len(os.listdir('sounds'))} fichiers générés dans sounds/")
