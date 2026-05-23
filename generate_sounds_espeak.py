import os
import subprocess

os.makedirs("sounds", exist_ok=True)

def gen(text, lang_code, filename):
    wav = f"/tmp/gq_{filename}.wav"
    mp3 = f"sounds/{filename}.mp3"
    espeak_lang = "fr" if lang_code == "fr" else "en"
    r1 = subprocess.run(["espeak-ng", "-v", espeak_lang, "-s", "130", "-w", wav, text],
                        capture_output=True)
    if r1.returncode != 0:
        print(f"SKIP {filename}: espeak error")
        return
    r2 = subprocess.run(["ffmpeg", "-y", "-i", wav, "-b:a", "32k", mp3],
                        capture_output=True)
    if r2.returncode == 0:
        print(f"OK  {mp3}")
    else:
        print(f"ERR {filename}: ffmpeg error")

# ==========================================
# FRANÇAIS — phonèmes
# ==========================================
fr_phonemes = {
    "a": "a", "e": "eu", "i": "i", "o": "o", "u": "u", "y": "i", "e_acc": "é",
    "ou": "ou", "on": "on", "an": "an", "in": "in", "au": "au", "oi": "oi",
    "eau": "au", "eu": "eu", "im": "in", "ei": "è", "en": "an",
    "m": "mmm", "n": "nnn", "l": "lll", "r": "rrr", "s": "sss",
    "z": "zzz", "f": "fff", "v": "vvv", "j": "jjj",
    "ch": "ch", "ph": "fff", "gn": "ni",
    "p": "puh", "b": "buh", "t": "tuh", "d": "duh",
    "c": "kuh", "k": "kuh", "g": "guh",
    "br": "br", "pr": "pr", "dr": "dr", "vr": "vr",
    "cl": "kl", "gl": "gl", "fl": "fl", "pl": "pl",
    "fr_blend": "fr", "cr": "kr", "tr": "tr"
}

for fname, text in fr_phonemes.items():
    gen(text, "fr", f"fr_{fname}")

# ==========================================
# FRANÇAIS — syllabes des mots du jeu
# ==========================================
fr_syllables = [
    ("ma", "ma"), ("pa", "pa"), ("la", "la"), ("ra", "ra"), ("sa", "sa"),
    ("fa", "fa"), ("va", "va"), ("na", "na"), ("ta", "ta"), ("da", "da"),
    ("ca", "ca"), ("ga", "ga"), ("ba", "ba"),
    ("mi", "mi"), ("pi", "pi"), ("li", "li"), ("ri", "ri"), ("si", "si"),
    ("fi", "fi"), ("vi", "vi"), ("ni", "ni"), ("ti", "ti"), ("di", "di"),
    ("mo", "mo"), ("po", "po"), ("lo", "lo"), ("ro", "ro"), ("so", "so"),
    ("fo", "fo"), ("vo", "vo"), ("no", "no"), ("to", "to"), ("do", "do"),
    ("mu", "mu"), ("pu", "pu"), ("lu", "lu"), ("ru", "ru"), ("su", "su"),
    ("fu", "fu"), ("nu", "nu"), ("tu", "tu"), ("du", "du"),
    ("me", "me"), ("pe", "pe"), ("le", "le"), ("re", "re"), ("se", "se"),
    ("fe", "fe"), ("ve", "ve"), ("ne", "ne"), ("te", "te"), ("de", "de"),
    ("man", "man"), ("pan", "pan"), ("fan", "fan"), ("ban", "ban"),
    ("mon", "mon"), ("son", "son"), ("bon", "bon"), ("ron", "ron"),
    ("peau", "po"), ("seau", "so"), ("gâ", "ga"), ("teau", "to"),
    ("ra", "ra"), ("ge", "je"), ("ma", "ma"), ("be", "be"),
    ("che", "che"), ("cha", "cha"), ("cho", "cho"),
    ("ou", "ou"), ("on", "on"), ("oi", "oi"), ("in", "in"), ("an", "an"),
    ("pluie", "pluie"), ("train", "train"), ("fleur", "fleur"),
    ("gri", "gri"), ("vau", "vau"), ("tour", "tour")
]

for fname, text in fr_syllables:
    gen(text, "fr", f"fr_syl_{fname}")

# ==========================================
# ANGLAIS — phonèmes
# ==========================================
en_phonemes = {
    "a": "a", "e": "e", "i": "i", "o": "o", "u": "u",
    "m": "mmm", "n": "nnn", "w": "www", "l": "lll", "s": "sss",
    "c": "kuh", "z": "zzz", "f": "fff", "v": "vvv",
    "t": "tuh", "p": "puh", "b": "buh", "d": "duh",
    "k": "kuh", "g": "guh",
    "sh": "sh", "ch": "ch", "th": "th",
    "ee": "ee", "ea": "ee", "oa": "oh", "ow": "ow",
    "oo": "oo", "ou": "ou",
    "ar": "ar", "er": "er", "or": "or", "ur": "er",
    "bl": "bl", "pl": "pl", "cl": "cl", "gl": "gl", "tr": "tr",
    "dr": "dr", "pr": "pr", "cr": "cr", "br": "br", "gr": "gr"
}

for fname, text in en_phonemes.items():
    gen(text, "en", f"en_{fname}")

# ==========================================
# ANGLAIS — syllabes des mots du jeu
# ==========================================
en_syllables = [
    ("cat", "cat"), ("mat", "mat"), ("sat", "sat"), ("hat", "hat"), ("bat", "bat"),
    ("pig", "pig"), ("big", "big"), ("dig", "dig"), ("fig", "fig"),
    ("cup", "cup"), ("pup", "pup"), ("sun", "sun"), ("fun", "fun"), ("run", "run"),
    ("bed", "bed"), ("red", "red"), ("fed", "fed"), ("leg", "leg"),
    ("hop", "hop"), ("top", "top"), ("mop", "mop"), ("pot", "pot"),
    ("fish", "fish"), ("ship", "ship"), ("shop", "shop"), ("shut", "shut"),
    ("chat", "chat"), ("chin", "chin"), ("chip", "chip"),
    ("this", "this"), ("that", "that"), ("them", "them"), ("then", "then"),
    ("tree", "tree"), ("free", "free"), ("bee", "bee"), ("see", "see"),
    ("boat", "boat"), ("coat", "coat"), ("road", "road"),
    ("book", "book"), ("look", "look"), ("cook", "cook"), ("foot", "foot"),
    ("rain", "rain"), ("tail", "tail"), ("snail", "snail"),
    ("farm", "farm"), ("car", "car"), ("star", "star"), ("bark", "bark"),
    ("bird", "bird"), ("turn", "turn"), ("burn", "burn"),
    ("corn", "corn"), ("born", "born"), ("fork", "fork"),
    ("black", "black"), ("flat", "flat"), ("clap", "clap"),
    ("drop", "drop"), ("drip", "drip"), ("trip", "trip"), ("trap", "trap"),
    ("crab", "crab"), ("grab", "grab"), ("grass", "grass"),
    ("broom", "broom"), ("proof", "proof"), ("fruit", "fruit")
]

for fname, text in en_syllables:
    gen(text, "en", f"en_syl_{fname}")

total = len(os.listdir("sounds"))
print(f"\nTerminé ! {total} fichiers MP3 dans sounds/")
