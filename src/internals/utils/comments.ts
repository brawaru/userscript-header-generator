export function blockComment(lines: string[]): string {
  let comment = "/*";

  const formatLine = (content: string) =>
    content.replace(/\*\//g, "*\\/").trim();

  if (lines.length > 1) {
    for (const line of lines) {
      comment += `\n${formatLine(line)}`;
    }

    comment += "\n";
  } else {
    comment += " " + formatLine(lines[0] ?? "") + " ";
  }

  comment += "*/";

  return comment;
}

export function slashesComment(lines: string[]): string {
  let comment = "";

  for (let i = 0, l = lines.length; i < l; i++) {
    comment += `// ${(lines[i] ?? "").trim()}`;

    if (i + 1 !== l) comment += "\n";
  }

  return comment;
}
