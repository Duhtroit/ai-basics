#!/usr/bin/env python3
"""Reading metrics per unit: Flesch reading ease and glossary-term density."""
import json
import os
import re
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOWELS = "aeiouy"


def syllables(word):
    word = re.sub(r"[^a-z]", "", word.lower())
    if not word:
        return 0
    count, prev = 0, False
    for ch in word:
        is_v = ch in VOWELS
        if is_v and not prev:
            count += 1
        prev = is_v
    if word.endswith("e") and count > 1 and not word.endswith(("le", "ee")):
        count -= 1
    return max(1, count)


def prose(c, entry=None):
    parts = [c.get("usecase", ""), c.get("breaks", "")]
    m = c.get("metaphor", {})
    parts += [m.get("claim", ""), m.get("lab", {}).get("tryText", ""), m.get("lab", {}).get("notice", "")]
    parts.append(c.get("idea", ""))
    parts.append(c.get("mechanics", {}).get("worked", ""))
    parts.append(c.get("now", ""))
    if entry:
        parts += [entry.get("teach", ""), entry.get("work", ""), entry.get("bridge", "")]
        practice = entry.get("practice", {})
        parts += [practice.get("q", ""), practice.get("a", ""), practice.get("answer", "")]
    text = " ".join(parts)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def main():
    data = json.loads(subprocess.run(
        ["node", os.path.join(ROOT, "scripts", "extract_units.mjs"), ROOT],
        capture_output=True, text=True, check=True).stdout)
    lessons = {lesson["n"]: lesson for lesson in json.loads(subprocess.run(
        ["node", os.path.join(ROOT, "scripts", "extract_teach.mjs")],
        capture_output=True, text=True, check=True).stdout)["lessons"]}
    terms = {k.lower() for k in data["glossary"]}
    pattern = re.compile(r"(?<![\w-])(" + "|".join(re.escape(t) for t in sorted(terms, key=len, reverse=True)) + r")(?:s|es)?(?![\w-])", re.I)
    print("| Unit | Concepts | Words | Flesch | Jargon per 100 words |")
    print("|---|---|---|---|---|")
    total_words = 0
    for u in sorted(data["units"], key=lambda x: x["n"]):
        lesson = lessons.get(u["n"], {})
        opening = [lesson.get("opening", ""), lesson.get("toolkit", "")]
        closing = lesson.get("closing", {})
        closing_parts = [closing.get("teach", ""), closing.get("problem", {}).get("q", ""), closing.get("problem", {}).get("answer", "")]
        text = " ".join(opening + closing_parts + [prose(c, lesson.get("concepts", {}).get(c["id"])) for c in u["concepts"]])
        words = re.findall(r"[A-Za-z][A-Za-z'-]*", text)
        sentences = max(1, len(re.findall(r"[.!?]+", text)))
        syl = sum(syllables(w) for w in words)
        n = max(1, len(words))
        flesch = 206.835 - 1.015 * (n / sentences) - 84.6 * (syl / n)
        jargon = len(pattern.findall(text)) / n * 100
        total_words += n
        print(f"| {u['n']:02d} | {len(u['concepts'])} | {n} | {flesch:.0f} | {jargon:.1f} |")
    print(f"\nTotal prose words: {total_words}")


if __name__ == "__main__":
    main()
