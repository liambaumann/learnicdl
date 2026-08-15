// Replaces hardcoded inline text colors in legacy HTML with theme-aware hue
// classes (see frontend/src/app.css ".hue-*" rules). Mechanical HSL-based
// classification, not a hardcoded list of known colors - see README.md and
// the plan history for why (a fixed color list can't handle content that
// doesn't exist yet, and "is this color meaningful" turned out to be a
// question neither a script nor a quick guess could reliably answer, but
// "is this color legible against both theme backgrounds" is fully computable).

const NAMED_COLORS = { black: "#000000", white: "#ffffff" };

const TAG_RE = /<([a-zA-Z][a-zA-Z0-9]*)((?:\s+[a-zA-Z-]+(?:=(?:"[^"]*"|'[^']*'))?)*)\s*(\/?)>/g;

function parseColor(value) {
  const v = value.trim().toLowerCase();
  if (NAMED_COLORS[v]) return NAMED_COLORS[v];
  const rgbMatch = v.match(/^rgb\(([^)]+)\)$/);
  if (rgbMatch) {
    const [r, g, b] = rgbMatch[1].split(",").map((s) => parseInt(s.trim(), 10));
    if ([r, g, b].some((n) => Number.isNaN(n))) return null;
    return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
  }
  const hexMatch = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hexMatch) {
    let h = hexMatch[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    return "#" + h;
  }
  return null;
}

function hexToHsl(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = 0;
    s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, l];
}

const SATURATION_THRESHOLD = 0.15;
const DARK_LIGHTNESS_THRESHOLD = 0.35;
const LIGHT_LIGHTNESS_THRESHOLD = 0.85;

function hueClassFor(h) {
  if (h < 20 || h >= 340) return "hue-red";
  if (h < 50) return "hue-orange";
  if (h < 70) return "hue-yellow";
  if (h < 170) return "hue-green";
  if (h < 260) return "hue-blue";
  return "hue-purple";
}

/** Classifies a single color value. Returns { class: string|null, warn: boolean }. */
export function classifyColor(hex) {
  const [h, s, l] = hexToHsl(hex);
  if (s < SATURATION_THRESHOLD) {
    if (l < DARK_LIGHTNESS_THRESHOLD) return { class: null, warn: false };
    if (l > LIGHT_LIGHTNESS_THRESHOLD) return { class: null, warn: true };
    return { class: "hue-gray", warn: false };
  }
  return { class: hueClassFor(h), warn: false };
}

/**
 * Transforms every inline `style="color: ...")` occurrence in `html` per
 * classifyColor(), merging the resulting hue class into any existing class
 * attribute, or stripping the style entirely with no class for
 * near-black/near-white. Style attributes with non-color properties mixed in
 * (confirmed in the real data to be 100% Word/paste bloat) are stripped
 * wholesale regardless of their color value.
 *
 * Returns { html, warnings } - warnings is a list of { originalColor } for
 * every near-white color found, since white-on-white text most plausibly
 * means someone was hiding/deleting content rather than choosing a color,
 * and stripping it would make previously-invisible text suddenly visible.
 */
export function normalizeInlineColors(html) {
  if (!html) return { html, warnings: [] };
  const warnings = [];

  const out = html.replace(TAG_RE, (fullMatch, tagName, attrs, selfClose) => {
    const styleMatch = attrs.match(/\sstyle="([^"]*)"/);
    if (!styleMatch || !/color\s*:/i.test(styleMatch[1])) return fullMatch;

    const props = styleMatch[1].split(";").map((s) => s.trim()).filter(Boolean);
    const colorProp = props.find((p) => /^color\s*:/i.test(p));
    const otherProps = props.filter((p) => p !== colorProp);

    let newAttrs = attrs.replace(/\sstyle="[^"]*"/, "");

    if (otherProps.length > 0) {
      return `<${tagName}${newAttrs}${selfClose}>`;
    }

    const colorValue = colorProp.slice(colorProp.indexOf(":") + 1).trim();
    const hex = parseColor(colorValue);
    if (!hex) return `<${tagName}${newAttrs}${selfClose}>`;

    const { class: cls, warn } = classifyColor(hex);
    if (warn) warnings.push({ originalColor: colorValue });

    if (cls) {
      const classMatch = newAttrs.match(/\sclass="([^"]*)"/);
      if (classMatch) {
        newAttrs = newAttrs.replace(/\sclass="[^"]*"/, ` class="${classMatch[1]} ${cls}"`);
      } else {
        newAttrs += ` class="${cls}"`;
      }
    }

    return `<${tagName}${newAttrs}${selfClose}>`;
  });

  return { html: out, warnings };
}
