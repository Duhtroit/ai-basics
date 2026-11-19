#!/usr/bin/env python3
"""Content checks for the AI Basics course.

Checks: field completeness, prerequisite order, glossary first use, guided
lesson coverage, widget registration, formula symbols, local asset paths, em
dashes, curly quotes and a short unslop phrase list. Exits non-zero on errors.
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
errors = []
warnings = []


def fail(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def load():
    out = subprocess.run(
        ["node", os.path.join(ROOT, "scripts", "extract_units.mjs"), ROOT],
        capture_output=True, text=True, check=True
    )
    return json.loads(out.stdout)


def concept_text(c):
    parts = [c.get("title", "")]
    for key in ("usecase", "breaks", "now"):
        parts.append(c.get(key, ""))
    m = c.get("metaphor", {})
    parts += [m.get("name", ""), m.get("claim", "")]
    parts += [x for row in m.get("mapping", []) for x in row]
    parts += [m.get("lab", {}).get("tryText", ""), m.get("lab", {}).get("notice", "")]
    parts.append(c.get("idea", ""))
    lec = c.get("lecture", {})
    parts += [lec.get("text", "")]
    mech = c.get("mechanics", {})
    parts += [mech.get("formula", ""), mech.get("worked", "")]
    parts += [x for row in mech.get("symbols", []) for x in row]
    parts += [c.get("connection", {}).get("prompt", ""), c.get("connection", {}).get("explain", "")]
    parts += c.get("recap", [])
    return " ".join(str(p) for p in parts if p)


def term_pattern(term):
    # allow plural and hyphen/space variation for multiword terms
    t = re.escape(term).replace(r"\ ", r"[\s-]")
    return re.compile(r"(?<![\w-])" + t + r"(?:s|es)?(?![\w-])", re.I)


def main():
    data = load()
    units = sorted(data["units"], key=lambda u: u["n"])
    glossary = data["glossary"]
    order = []
    by_id = {}
    for u in units:
        seen = set()
        for i, c in enumerate(u.get("concepts", [])):
            if c["id"] in seen:
                fail(f"duplicate concept id {c['id']}")
            seen.add(c["id"])
            order.append((u, c))
            by_id[c["id"]] = (len(order) - 1, u, c)
    index = {c["id"]: i for i, (u, c) in enumerate(order)}

    required = ["id", "title", "prereqs", "usecase", "metaphor", "idea", "lecture",
                "mechanics", "breaks", "check", "connection", "recap", "now"]
    for u, c in order:
        for key in required:
            if key not in c:
                fail(f"{u['n']}/{c['id']}: missing {key}")
        if len(c.get("check", [])) < 2:
            fail(f"{u['n']}/{c['id']}: fewer than two knowledge checks")
        for p in c.get("prereqs", []):
            if p not in index:
                fail(f"{u['n']}/{c['id']}: unknown prerequisite {p}")
            elif index[p] >= index[c["id"]]:
                fail(f"{u['n']}/{c['id']}: prerequisite {p} is not earlier")
        mech = c.get("mechanics", {})
        if not mech.get("formula") or not mech.get("symbols"):
            fail(f"{u['n']}/{c['id']}: formula or symbol table missing")
        syms = " ".join(row[0] for row in mech.get("symbols", []))
        for token in set(re.findall(r"(?<![A-Za-z])[A-Za-zα-ωΑ-Ω](?![A-Za-z])", mech.get("formula", ""))):
            if token.lower() in {"a", "an", "is", "of", "to", "in", "or", "be"}:
                continue
            if not re.search(r"(?<![A-Za-z])" + re.escape(token) + r"(?![A-Za-z])", syms):
                warn(f"{u['n']}/{c['id']}: formula symbol '{token}' missing from symbol table")

    # widget registrations
    registered = set()
    wdir = os.path.join(ROOT, "js", "widgets")
    for name in os.listdir(wdir):
        if name.endswith(".js"):
            with open(os.path.join(wdir, name), encoding="utf-8") as fh:
                registered.update(re.findall(r"AIM\.register\('([a-z0-9-]+)'", fh.read()))
    with open(os.path.join(ROOT, "js", "scenes.js"), encoding="utf-8") as fh:
        scenes_src = fh.read()
    registered.update(re.findall(r"AIM\.register\('([a-z0-9-]+)'", scenes_src))
    scene_ids = set(re.findall(r"^  add\('([^']+)'", scenes_src, re.M))
    for u in units:
        for c in u["concepts"]:
            if c["id"] not in scene_ids:
                fail(f"{u['n']}/{c['id']}: no metaphor scene")
    for sid in sorted(scene_ids - {c["id"] for u in units for c in u["concepts"]}):
        fail(f"scene {sid}: has no concept")
    for u in units:
        for c in u["concepts"]:
            for spec in (c.get("metaphor", {}), c.get("mechanism", {}), c.get("sandbox", {})):
                wid = spec.get("widget") if spec else None
                if wid and wid not in registered:
                    fail(f"{u['n']}/{c['id']}: widget {wid} is not registered")

    # assessment formats: every unit mixes selected response with numeric,
    # ordering, spot-the-error and short-answer items, and carries pairs.
    test_total = 0
    pair_total = 0
    for u in units:
        kinds = []
        for qi, q in enumerate(u.get("test", [])):
            kind = q.get("type", "choice")
            kinds.append(kind)
            test_total += 1
            where = f"{u['n']}/test/{qi + 1}"
            if kind not in {"choice", "numeric", "ordering", "error", "short"}:
                fail(f"{where}: unknown item type {kind}")
            elif kind == "numeric":
                if not isinstance(q.get("answer"), (int, float)) or isinstance(q.get("answer"), bool):
                    fail(f"{where}: numeric answer is not a number")
                if not q.get("explain"):
                    fail(f"{where}: numeric item has no explanation")
            elif kind == "ordering":
                steps = q.get("items", [])
                if len(steps) < 3:
                    fail(f"{where}: ordering item needs at least three steps")
                if len(set(steps)) != len(steps):
                    fail(f"{where}: ordering item repeats a step")
                if not q.get("explain"):
                    fail(f"{where}: ordering item has no explanation")
            elif kind == "error":
                steps = q.get("steps", [])
                if len(steps) < 3:
                    fail(f"{where}: spot-the-error item needs at least three steps")
                ans = q.get("answer")
                if not isinstance(ans, int) or isinstance(ans, bool) or not 0 <= ans < len(steps):
                    fail(f"{where}: spot-the-error answer is not a valid step index")
                if not q.get("explain"):
                    fail(f"{where}: spot-the-error item has no explanation")
            elif kind == "short":
                if len(q.get("rubric", [])) < 2:
                    fail(f"{where}: short-answer item needs a rubric")
                if not q.get("model"):
                    fail(f"{where}: short-answer item has no model answer")
            else:
                opts = q.get("options", [])
                ans = q.get("answer")
                if len(opts) < 2:
                    fail(f"{where}: choice item has fewer than two options")
                if not isinstance(ans, int) or isinstance(ans, bool) or not 0 <= ans < len(opts):
                    fail(f"{where}: choice answer is not a valid option index")
                if not q.get("explain"):
                    fail(f"{where}: choice item has no explanation")
        for kind in ("numeric", "ordering", "error", "short"):
            if kind not in kinds:
                fail(f"{u['n']}: unit test has no {kind} item")
        if kinds.count("choice") < 4:
            fail(f"{u['n']}: fewer than four choice items for the exam pool")
        pairs = u.get("pairs", [])
        if len(pairs) < 3:
            fail(f"{u['n']}: fewer than three same-or-different pairs")
        for pi, p in enumerate(pairs):
            pair_total += 1
            if not isinstance(p.get("same"), bool):
                fail(f"{u['n']}/pair/{pi + 1}: same must be true or false")
            for key in ("a", "b", "claim", "explain"):
                if not p.get(key):
                    fail(f"{u['n']}/pair/{pi + 1}: missing {key}")
        if pairs and len({p.get("same") for p in pairs}) < 2:
            warn(f"{u['n']}: pairs do not mix same and different")

    # generated manifest matches the unit files
    manifest_path = os.path.join(ROOT, "content", "manifest.js")
    try:
        src = open(manifest_path, encoding="utf-8").read()
        manifest = json.loads(src[src.index("(") + 1:src.rindex(")")])
    except (OSError, ValueError) as exc:
        manifest = []
        fail(f"content/manifest.js: cannot read generated manifest ({exc})")
    by_unit = {m.get("n"): m for m in manifest}
    if len(by_unit) != len(units):
        fail(f"content/manifest.js: {len(by_unit)} units, expected {len(units)}")
    for u in units:
        m = by_unit.get(u["n"])
        if not m:
            fail(f"content/manifest.js: missing unit {u['n']}")
            continue
        if m.get("title") != u.get("title") or len(m.get("concepts", [])) != len(u.get("concepts", [])):
            fail(f"content/manifest.js: unit {u['n']} is stale")
            continue
        for c, mc in zip(u["concepts"], m["concepts"]):
            if mc.get("id") != c["id"] or mc.get("title") != c["title"] or mc.get("checks") != len(c.get("check", [])):
                fail(f"content/manifest.js: unit {u['n']} concept {c['id']} is stale")
        for key in ("file", "teach", "widget"):
            if not os.path.exists(os.path.join(ROOT, m.get(key, ""))):
                fail(f"content/manifest.js: missing {key} for unit {u['n']}")
        for extra in m.get("extraWidgets", []):
            if not os.path.exists(os.path.join(ROOT, extra)):
                fail(f"content/manifest.js: missing extra widget {extra} for unit {u['n']}")

    # guided lessons cover every concept, in order, with a full teaching block
    try:
        teach_out = subprocess.run(
            ["node", os.path.join(ROOT, "scripts", "extract_teach.mjs")],
            capture_output=True, text=True, check=True
        )
        lessons = json.loads(teach_out.stdout).get("lessons", [])
    except (subprocess.CalledProcessError, ValueError) as exc:
        lessons = []
        fail(f"content/teach: cannot load lessons ({exc})")
    lesson_by_unit = {lesson.get("n"): lesson for lesson in lessons}
    if len(lesson_by_unit) != len(units):
        fail(f"content/teach: {len(lesson_by_unit)} lessons, expected {len(units)}")

    def word_count(text):
        text = re.sub(r"<[^>]+>", " ", text or "")
        text = re.sub(r"&[a-z]+;", " ", text)
        return len(re.findall(r"\S+", text))

    for u in units:
        lesson = lesson_by_unit.get(u["n"])
        if not lesson:
            fail(f"content/teach: missing lesson for unit {u['n']}")
            continue
        if not word_count(lesson.get("opening")):
            fail(f"content/teach/{u['n']}: empty opening")
        closing = lesson.get("closing", {})
        if not word_count(closing.get("teach")):
            fail(f"content/teach/{u['n']}: empty closing teaching")
        problem = closing.get("problem", {})
        for key in ("q", "answer"):
            if not word_count(problem.get(key)):
                fail(f"content/teach/{u['n']}: closing problem missing {key}")
        taught = lesson.get("concepts", {})
        ids = [c["id"] for c in u["concepts"]]
        if list(taught.keys()) != ids:
            fail(f"content/teach/{u['n']}: concept coverage does not match the unit order")
        for cid in ids:
            entry = taught.get(cid, {})
            for key in ("teach", "work", "bridge"):
                if not word_count(entry.get(key)):
                    fail(f"content/teach/{u['n']}/{cid}: missing {key}")
            if word_count(entry.get("teach")) < 180:
                fail(f"content/teach/{u['n']}/{cid}: teaching block under 180 words")
            practice = entry.get("practice", {})
            for key in ("q", "answer"):
                if not word_count(practice.get(key)):
                    fail(f"content/teach/{u['n']}/{cid}: practice missing {key}")

    # glossary first use
    def first_use(term):
        pat = term_pattern(term)
        for i, (u, c) in enumerate(order):
            if pat.search(concept_text(c)):
                return i
        return None

    for term, meta in glossary.items():
        at = meta.get("at")
        if at not in index:
            fail(f"glossary '{term}': unknown concept {at}")
            continue
        used = first_use(term)
        if used is None:
            warn(f"glossary '{term}': never used in concept prose")
        elif used < index[at]:
            u, c = order[used]
            fail(f"glossary '{term}': first used in {u['n']}/{c['id']} but defined at {at}")

    # scans over source files
    files = ["index.html", "css/course.css"]
    for base, _, names in os.walk(ROOT):
        if any(skip in base for skip in (".venv", "_sources", ".git", ".verify", "artifacts", "screenshots")):
            continue
        for n in names:
            if n.endswith((".js", ".css", ".html", ".md")):
                files.append(os.path.relpath(os.path.join(base, n), ROOT))
    bad_phrases = ["not just", "it's important to note", "it is important to note",
                   "delve", "leverage", "seamless", "robust", "crucial", "tapestry",
                   "dive into", "unlock", "elevate", "furthermore", "moreover",
                   "in conclusion", "when it comes to", "at the end of the day"]
    for rel in sorted(set(files)):
        path = os.path.join(ROOT, rel)
        try:
            with open(path, encoding="utf-8") as fh:
                text = fh.read()
        except UnicodeDecodeError:
            continue
        if "\u2014" in text:
            fail(f"{rel}: em dash found")
        if re.search(r"[\u201c\u201d\u2018\u2019]", text):
            fail(f"{rel}: curly quote found")
        low = text.lower()
        for phrase in bad_phrases:
            if phrase in low:
                fail(f"{rel}: unslop phrase '{phrase}'")

    # local links in index.html
    with open(os.path.join(ROOT, "index.html"), encoding="utf-8") as fh:
        html = fh.read()
    for attr in re.findall(r'(?:src|href)="([^"#][^"]*)"', html):
        if attr.startswith(("http", "//", "mailto:", "data:")):
            continue
        if not os.path.exists(os.path.join(ROOT, attr)):
            fail(f"index.html: missing asset {attr}")
    with open(os.path.join(ROOT, "css", "course.css"), encoding="utf-8") as fh:
        css = fh.read()
    for url in re.findall(r'url\("([^"]+)"\)', css):
        target = os.path.normpath(os.path.join(ROOT, "css", url))
        if not os.path.exists(target):
            fail(f"course.css: missing asset {url}")
    total = 0
    for base, _, names in os.walk(os.path.join(ROOT, "assets")):
        total += sum(os.path.getsize(os.path.join(base, n)) for n in names)
    print(f"assets: {total / 1024:.0f} KB")
    print(f"concepts: {len(order)}, units: {len(units)}, terms: {len(glossary)}")
    print(f"assessment: {test_total} unit-test items, {pair_total} same-or-different pairs")
    print(f"manifest: {len(by_unit)} units")

    for w in warnings:
        print("WARN", w)
    for e in errors:
        print("FAIL", e)
    print(f"{len(errors)} errors, {len(warnings)} warnings")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
