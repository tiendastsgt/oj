import argparse
import difflib
import os
import re
from pathlib import Path

# Emoji / símbolos comunes (rangos + dingbats + variation selector)
EMOJI_RE = re.compile(
    r"[\uFE0F"                          # variation selector
    r"\U0001F1E6-\U0001F1FF"            # flags
    r"\U0001F300-\U0001FAFF"            # emoticons/symbols/pictographs
    r"\u2600-\u26FF"                    # misc symbols
    r"\u2700-\u27BF"                    # dingbats (✅ etc.)
    r"]",
    flags=re.UNICODE
)

BOX_DRAWING_RE = re.compile(r"[╔╗╚╝║═]+")

CHECKLIST_START_RE = re.compile(r"^(\s*[-*]?\s*)(✅|✔️|☑️|✓)\s+")
STATUS_EMOJI_MAP = {
    "✅": "Completada",
    "⏳": "En progreso",
    "🔄": "En revisión",
    "❌": "Bloqueada",
    "🟡": "En progreso",
    "🟢": "Completada",
    "🔴": "Bloqueada",
}

# Reemplazos puntuales (puedes ampliar esto con tus frases recurrentes)
PHRASE_RULES = [
    # Ejemplo: "El stack actualizado (...) es la VERDAD ACTUAL y ÚNICA."
    (
        re.compile(
            r"El\s+stack\s+actualizado\s*\(([^)]+)\)\s+es\s+la\s+VERDAD\s+ACTUAL\s+y\s+ÚNICA\.",
            flags=re.IGNORECASE
        ),
        r"Stack oficial (vigente): \1."
    ),
    (
        re.compile(r"\bVERDAD\s+ACTUAL\s+y\s+ÚNICA\b", flags=re.IGNORECASE),
        "vigente"
    ),
]

SPANISH_LOWER_WORDS = {
    "de", "del", "la", "el", "y", "o", "en", "para", "por", "con", "a", "al", "un", "una"
}

DEFAULT_ACRONYMS = {
    "SGED", "CI", "CD", "API", "JWT", "SQL", "JPA", "ORM", "HTTP", "HTTPS", "DEV", "QA",
    "UI", "UX", "SLA", "DTO", "POJO", "UID", "UUID", "CPU", "RAM", "URL", "URI"
}

def strip_emojis(text: str) -> str:
    # Primero reemplaza algunos emojis de estado por texto (por si estaban solos)
    for k, v in STATUS_EMOJI_MAP.items():
        text = text.replace(k, v)
    # Luego elimina el resto de emojis/símbolos
    text = EMOJI_RE.sub("", text)
    # Limpia dobles espacios derivados
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text

def smart_title_case(s: str, acronyms=None) -> str:
    acronyms = acronyms or DEFAULT_ACRONYMS
    words = re.split(r"(\s+)", s.strip())
    out = []
    for w in words:
        if w.isspace():
            out.append(w)
            continue
        raw = re.sub(r"[^\wÁÉÍÓÚÜÑáéíóúüñ\-]", "", w)
        if raw.upper() in acronyms:
            out.append(w.upper())
            continue
        lw = raw.lower()
        if lw in SPANISH_LOWER_WORDS:
            out.append(lw)
            continue
        # Capitaliza primera letra (respetando guiones)
        parts = w.split("-")
        cap_parts = []
        for p in parts:
            if not p:
                cap_parts.append(p)
            else:
                cap_parts.append(p[:1].upper() + p[1:].lower())
        out.append("-".join(cap_parts))
    return "".join(out)

def normalize_all_caps_headings(line: str) -> str:
    # Si parece un título en mayúsculas (y no es muy corto), lo pasamos a title case.
    stripped = line.strip()
    letters = re.sub(r"[^A-ZÁÉÍÓÚÜÑ]", "", stripped)
    if len(stripped) >= 8 and len(letters) >= max(6, int(0.6 * len(re.sub(r"[^A-ZÁÉÍÓÚÜÑa-záéíóúüñ]", "", stripped)))):
        # Ej: "ROADMAP PROYECTO SGED" -> "Roadmap Proyecto SGED"
        return smart_title_case(stripped)
    return line.rstrip("\n")

def apply_phrase_rules(text: str) -> str:
    for pattern, repl in PHRASE_RULES:
        text = pattern.sub(repl, text)
    return text

def convert_checklist_to_bullets(line: str) -> str:
    # ✅ Algo -> - Algo
    m = CHECKLIST_START_RE.match(line)
    if not m:
        return line
    prefix = m.group(1)
    rest = line[m.end():].strip()
    # Asegura punto final (opcional; si no quieres, quítalo)
    if rest and rest[-1] not in ".;:!?":
        rest += "."
    return f"{prefix}- {rest}\n"

def unbox_ascii_art(lines):
    """
    Convierte bloques con box drawing (╔═║...) a texto simple.
    Mantiene el contenido de las líneas internas, sin bordes.
    """
    out = []
    i = 0
    n = len(lines)
    while i < n:
        if BOX_DRAWING_RE.search(lines[i]):
            # Captura bloque consecutivo
            block = []
            while i < n and (BOX_DRAWING_RE.search(lines[i]) or "║" in lines[i] or "╔" in lines[i] or "╚" in lines[i]):
                block.append(lines[i])
                i += 1
            # Procesa bloque: quita bordes y deja texto
            for b in block:
                # Quita caracteres de borde
                cleaned = re.sub(r"[╔╗╚╝║═]+", " ", b)
                cleaned = cleaned.strip()
                cleaned = strip_emojis(cleaned)
                cleaned = re.sub(r"[ \t]{2,}", " ", cleaned).strip()
                if cleaned:
                    out.append(cleaned + "\n")
            # Línea en blanco separadora (opcional)
            if out and out[-1].strip():
                out.append("\n")
        else:
            out.append(lines[i])
            i += 1
    return out

def truncate_code_block(block_lines, max_lines=40, head=12, tail=8):
    if len(block_lines) <= max_lines:
        return block_lines
    return (
        block_lines[:head]
        + [f"... (bloque de código truncado: {len(block_lines)} líneas; revisa el archivo original) ...\n"]
        + block_lines[-tail:]
    )

def process_markdown(text: str, truncate_code=False) -> str:
    text = apply_phrase_rules(text)
    lines = text.splitlines(keepends=True)

    # 1) Desarmar cuadros ASCII primero (para luego limpiar emojis dentro)
    lines = unbox_ascii_art(lines)

    out = []
    in_code = False
    code_fence = None
    current_code_block = []

    for line in lines:
        # Detecta fences ``` o ~~~
        fence_match = re.match(r"^(\s*)(```+|~~~+)", line)
        if fence_match:
            fence = fence_match.group(2)
            if not in_code:
                in_code = True
                code_fence = fence
                out.append(line)
            else:
                # Cierra bloque
                in_code = False
                code_fence = None
                # Si truncamos, aplicamos sobre lo acumulado (sin tocar fences)
                if truncate_code:
                    current_code_block = truncate_code_block(current_code_block)
                out.extend(current_code_block)
                current_code_block = []
                out.append(line)
            continue

        if in_code:
            current_code_block.append(line)
            continue

        # Fuera de código: limpiar
        original = line

        # Checklists visuales -> bullets
        line = convert_checklist_to_bullets(line)

        # Quitar emojis/símbolos
        line = strip_emojis(line)

        # Normalizar headings Markdown y títulos en caps
        if re.match(r"^\s*#{1,6}\s+", line):
            # Quita emojis ya hecho, ahora title-case suave si venía todo caps
            prefix = re.match(r"^(\s*#{1,6}\s+)", line).group(1)
            content = line[len(prefix):].strip()
            content = normalize_all_caps_headings(content)
            line = prefix + content.strip() + "\n"
        else:
            # Primera línea tipo "ROADMAP PROYECTO SGED" sin #
            if original.strip() and original.strip() == original.strip().upper():
                normalized = normalize_all_caps_headings(original.strip())
                if normalized != original.strip():
                    line = normalized + "\n"

        # Limpiar exceso de negritas en MAYÚSCULAS (suave)
        # Ej: "**VERDAD ACTUAL**" -> "verdad actual"
        line = re.sub(r"\*\*([A-ZÁÉÍÓÚÜÑ\s]{6,})\*\*", lambda m: m.group(1).lower(), line)

        # Compactar espacios
        line = re.sub(r"[ \t]{2,}", " ", line)

        out.append(line)

    # Si el archivo termina dentro de un bloque de código (raro), lo volcamos
    if current_code_block:
        if truncate_code:
            current_code_block = truncate_code_block(current_code_block)
        out.extend(current_code_block)

    return "".join(out)

def main():
    ap = argparse.ArgumentParser(description="Humaniza/limpia un ROADMAP Markdown (menos emojis, menos dramatismo, más sobrio).")
    ap.add_argument("path", help="Ruta al archivo .md")
    ap.add_argument("--inplace", action="store_true", help="Sobrescribe el archivo original (crea .bak)")
    ap.add_argument("--backup", action="store_true", help="Crea backup .bak al escribir inplace")
    ap.add_argument("--diff", action="store_true", help="Imprime diff unificado por stdout")
    ap.add_argument("--truncate-code", action="store_true", help="Trunca bloques de código largos (opcional)")
    args = ap.parse_args()

    path = Path(args.path)
    if not path.exists():
        raise SystemExit(f"No existe: {path}")

    original = path.read_text(encoding="utf-8")
    cleaned = process_markdown(original, truncate_code=args.truncate_code)

    if args.diff:
        diff = difflib.unified_diff(
            original.splitlines(),
            cleaned.splitlines(),
            fromfile=str(path),
            tofile=str(path) + " (humanized)",
            lineterm=""
        )
        print("\n".join(diff))

    if args.inplace:
        if args.backup:
            backup_path = path.with_suffix(path.suffix + ".bak")
            backup_path.write_text(original, encoding="utf-8")
        path.write_text(cleaned, encoding="utf-8")
        print(f"OK: escrito en {path}")
        if args.backup:
            print(f"Backup: {backup_path}")
    else:
        out_path = path.with_name(path.stem + ".human.md")
        out_path.write_text(cleaned, encoding="utf-8")
        print(f"OK: escrito en {out_path}")

if __name__ == "__main__":
    main()