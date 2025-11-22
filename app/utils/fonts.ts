export interface FontOption {
  name: string;
  label: string;
  category: 'serif' | 'sans-serif' | 'monospace' | 'display';
  googleFont?: string;
  fallback: string;
}

export const availableFonts: FontOption[] = [
  // Sans-serif fonts
  {
    name: "Inter",
    label: "Inter",
    category: "sans-serif",
    googleFont: "Inter:wght@300;400;500;600;700",
    fallback: "ui-sans-serif, system-ui, sans-serif"
  },
  {
    name: "IBM Plex Sans",
    label: "IBM Plex Sans",
    category: "sans-serif",
    googleFont: "IBM+Plex+Sans:wght@300;400;500;600;700",
    fallback: "ui-sans-serif, system-ui, sans-serif"
  },
  {
    name: "Roboto",
    label: "Roboto",
    category: "sans-serif",
    googleFont: "Roboto:wght@300;400;500;700",
    fallback: "ui-sans-serif, system-ui, sans-serif"
  },
  {
    name: "Open Sans",
    label: "Open Sans",
    category: "sans-serif",
    googleFont: "Open+Sans:wght@300;400;500;600;700",
    fallback: "ui-sans-serif, system-ui, sans-serif"
  },
  {
    name: "Lato",
    label: "Lato",
    category: "sans-serif",
    googleFont: "Lato:wght@300;400;700",
    fallback: "ui-sans-serif, system-ui, sans-serif"
  },
  {
    name: "Poppins",
    label: "Poppins",
    category: "sans-serif",
    googleFont: "Poppins:wght@300;400;500;600;700",
    fallback: "ui-sans-serif, system-ui, sans-serif"
  },
  {
    name: "Montserrat",
    label: "Montserrat",
    category: "sans-serif",
    googleFont: "Montserrat:wght@300;400;500;600;700",
    fallback: "ui-sans-serif, system-ui, sans-serif"
  },
  {
    name: "Source Sans Pro",
    label: "Source Sans Pro",
    category: "sans-serif",
    googleFont: "Source+Sans+Pro:wght@300;400;600;700",
    fallback: "ui-sans-serif, system-ui, sans-serif"
  },
  {
    name: "Helvetica",
    label: "Helvetica",
    category: "sans-serif",
    fallback: "Helvetica, Arial, sans-serif"
  },
  {
    name: "Arial",
    label: "Arial",
    category: "sans-serif",
    fallback: "Arial, sans-serif"
  },

  // Serif fonts
  {
    name: "Playfair Display",
    label: "Playfair Display",
    category: "serif",
    googleFont: "Playfair+Display:wght@400;500;600;700",
    fallback: "Georgia, serif"
  },
  {
    name: "Merriweather",
    label: "Merriweather",
    category: "serif",
    googleFont: "Merriweather:wght@300;400;700",
    fallback: "Georgia, serif"
  },
  {
    name: "Lora",
    label: "Lora",
    category: "serif",
    googleFont: "Lora:wght@400;500;600;700",
    fallback: "Georgia, serif"
  },
  {
    name: "Georgia",
    label: "Georgia",
    category: "serif",
    fallback: "Georgia, serif"
  },
  {
    name: "Times New Roman",
    label: "Times New Roman",
    category: "serif",
    fallback: "Times New Roman, serif"
  },

  // Monospace fonts
  {
    name: "JetBrains Mono",
    label: "JetBrains Mono",
    category: "monospace",
    googleFont: "JetBrains+Mono:wght@300;400;500;600;700",
    fallback: "ui-monospace, monospace"
  },
  {
    name: "Source Code Pro",
    label: "Source Code Pro",
    category: "monospace",
    googleFont: "Source+Code+Pro:wght@300;400;500;600;700",
    fallback: "ui-monospace, monospace"
  },
  {
    name: "Courier New",
    label: "Courier New",
    category: "monospace",
    fallback: "Courier New, monospace"
  },
  {
    name: "Fira Code",
    label: "Fira Code",
    category: "monospace",
    googleFont: "Fira+Code:wght@300;400;500;600;700",
    fallback: "ui-monospace, monospace"
  },

  // Display fonts
  {
    name: "Silkscreen",
    label: "Silkscreen",
    category: "display",
    googleFont: "Silkscreen:wght@400;700",
    fallback: "monospace"
  },
  {
    name: "Wallpoet",
    label: "Wallpoet",
    category: "display",
    googleFont: "Wallpoet",
    fallback: "monospace"
  },
  {
    name: "Orbitron",
    label: "Orbitron",
    category: "display",
    googleFont: "Orbitron:wght@400;500;600;700;800;900",
    fallback: "monospace"
  },
  {
    name: "Audiowide",
    label: "Audiowide",
    category: "display",
    googleFont: "Audiowide",
    fallback: "monospace"
  },
  {
    name: "Press Start 2P",
    label: "Press Start 2P",
    category: "display",
    googleFont: "Press+Start+2P",
    fallback: "monospace"
  }
];

export const getFontFamily = (fontName: string): string => {
  // Check if it's a Google Font (not in our legacy list)
  const font = availableFonts.find(f => f.name === fontName);
  if (font) {
    if (font.googleFont) {
      return `"${font.name}", ${font.fallback}`;
    }
    return font.fallback;
  }
  
  // Assume it's a Google Font if not found in legacy list
  // Return with appropriate fallback based on common naming
  const lowerName = fontName.toLowerCase();
  if (lowerName.includes('mono') || lowerName.includes('code')) {
    return `"${fontName}", ui-monospace, monospace`;
  }
  if (lowerName.includes('serif') || lowerName.includes('display')) {
    return `"${fontName}", Georgia, serif`;
  }
  
  return `"${fontName}", ui-sans-serif, system-ui, sans-serif`;
};

export const getGoogleFontsUrl = (): string => {
  const googleFonts = availableFonts
    .filter(font => font.googleFont)
    .map(font => font.googleFont)
    .join('&family=');
  
  return `https://fonts.googleapis.com/css2?family=${googleFonts}&display=swap`;
};
