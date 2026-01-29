def parse_architecture_ascii(lines):
    """
    Extrae capas a partir de un bloque ASCII de arquitectura.
    Es tolerante: ignora bordes, separadores y titulos generales,
    y se queda con las líneas de contenido.
    """
    box_chars = set("┌┐└┘├┤┬┴┼─│═║╔╗╚╝╠╣╦╩╬+|- ")

    content_rows = []

    for line in lines:
        # Quitamos saltos de línea
        raw = line.rstrip("\r\n")
        stripped = raw.strip()

        # Línea completamente vacía
        if not stripped:
            content_rows.append("")
            continue

        # Si la línea está formada SOLO por caracteres de caja (bordes),
        # la tratamos como separador entre bloques
        if all(ch in box_chars for ch in stripped):
            content_rows.append("")
            continue

        # Eliminamos posibles bordes laterales (│ o |) y espacios
        inner = re.sub(r'^[\s│|]+', '', raw)
        inner = re.sub(r'[\s│|]+$', '', inner)
        inner_stripped = inner.strip()

        if not inner_stripped:
            content_rows.append("")
            continue

        # Saltar títulos generales como "ARQUITECTURA SIMPLIFICADA"
        if "ARQUITECTURA" in inner_stripped.upper():
            content_rows.append("")
            continue

        content_rows.append(inner_stripped)

    # Agrupamos en capas usando líneas en blanco como separador
    groups = []
    current = []

    for row in content_rows:
        if row == "":
            if current:
                groups.append(current)
                current = []
        else:
            current.append(row)

    if current:
        groups.append(current)

    return groups


def build_plantuml_from_groups(groups):
    """
    Genera código PlantUML para un diagrama de capas apiladas
    con colores suaves y texto alineado.
    """
    colors = ["#C7E3FF", "#CFEFD0", "#FFE4C4", "#E3E3E3", "#D9C2FF"]

    lines = []
    lines.append("@startuml")
    lines.append("skinparam backgroundColor #FFFFFF")
    lines.append("skinparam shadowing true")
    lines.append("skinparam defaultTextAlignment left")
    lines.append("skinparam rectangle {")
    lines.append("  RoundCorner 15")
    lines.append("  BorderColor #777777")
    lines.append("  FontSize 16")
    lines.append("}")

    aliases = []

    for idx, grp in enumerate(groups):
        header = grp[0]
        desc_lines = grp[1:]

        alias = f"B{idx + 1}"
        aliases.append(alias)

        cleaned_desc = []
        for d in desc_lines:
            # Quitar prefijos tipo "└──", "├──", "- ", "• ", etc.
            clean = re.sub(r'^[\s└├\-•│>]+', '', d)
            cleaned_desc.append("• " + clean)  # añadimos viñeta

        label = "<b>" + header.replace('"', '\\"') + "</b>"
        body = ""
        if cleaned_desc:
            body = "\\n" + "\\n".join(s.replace('"', '\\"') for s in cleaned_desc)

        color = colors[idx % len(colors)]
        lines.append(f'rectangle "{label}{body}" as {alias} {color}')

    # Flechas verticales entre capas
    for i in range(len(aliases) - 1):
        lines.append(f"{aliases[i]} -down-> {aliases[i + 1]}")

    lines.append("@enduml")
    return "\n".join(lines)