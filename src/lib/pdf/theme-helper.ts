export function getFontFamilies(themeFont?: string) {
  const font = themeFont || "Helvetica";

  if (font === "Times-Roman" || font === "Times") {
    return {
      regular: "Times-Roman",
      bold: "Times-Bold",
      italic: "Times-Italic",
    };
  }

  if (font === "Courier") {
    return {
      regular: "Courier",
      bold: "Courier-Bold",
      italic: "Courier-Oblique",
    };
  }

  return {
    regular: "Helvetica",
    bold: "Helvetica-Bold",
    italic: "Helvetica-Oblique",
  };
}
