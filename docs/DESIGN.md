# Gestaltungsrichtlinien

Diese Richtlinien beschreiben die Design-Sprache der Lern-Oberfläche (Header, Modul-/Quiz-Übersicht, Frage-Screen, Ergebnis-Screen). Der Admin-Bereich (`/admin/*`) nutzt bewusst ein eigenes, nüchternes Farbthema (siehe unten) und ist nicht Gegenstand dieser Regeln.

## Grundprinzip
Freundlicher, spielerischer „3D-Button"-Look: dicke, asymmetrische Rahmen, großzügig abgerundete Ecken, viel Weißraum, eine klare Primärfarbe. Konsistent über Header, Listen, Fragekarten und Buttons hinweg.

## Farben

### Primärfarbe
- ICDL Blau: `rgb(0, 159, 226)` → CSS-Variable `--color-primary` in `app.css`
- Die Tailwind-Skala 50–950 wird automatisch per `color-mix()` aus diesem einen Wert erzeugt — **nie eigene Blautöne hardcoden**, immer `primary-50` … `primary-950` verwenden
- Verwendung: primäre Buttons, aktive/ausgewählte Zustände, Fortschrittsbalken, Hover-Akzente

### Neutralfarbe — ausschließlich Slate
**Regel: Für Grau immer Tailwinds `slate-*`-Skala verwenden, nie `gray-*`.** Das Dark-Mode-Overlay in `app.css` (`dm-text2`, `dm-text3`, `dm-icon`, `dm-progress`, `dm-card` …) ist exakt aus Slate-Hex-Werten aufgebaut (`#94a3b8` = slate-400, `#64748b` = slate-500, `#475569` = slate-600, `#334155` = slate-700) — das ist die eigentliche Quelle der Wahrheit für die Neutralpalette. `gray-*`-Klassen im Light-Mode (aktuell u. a. in Header, `QuestionCard`, `Option`, `InfoSheet`) sind eine Abweichung davon, siehe „Bekannte Abweichungen" unten.

Text-Hierarchie (Light Mode):

| Stufe | Klasse | Verwendung |
|---|---|---|
| Überschrift | `text-slate-900` | Seitentitel |
| Betont | `text-slate-800` | Karten-/Zeilentitel, wichtige Labels |
| Standard | `text-slate-700` | Fließtext, Formular-Labels |
| Sekundär | `text-slate-500` | Beschreibungen, Nebentext |
| Meta/Eyebrow | `text-slate-400` | Kleingedrucktes, uppercase Labels |
| Dekorativ | `text-slate-300` | inaktive Icons (z. B. Chevron) |

Rahmen/Divider: `border-slate-300` (Karten-Rahmen), `divide-slate-200` (Listenzeilen).

### Statusfarben (Quiz-Feedback)
- Richtig: Rahmen/Icon `green-500`, Hintergrund `green-50`, Text `green-900`
- Falsch: Rahmen/Icon `red-500`, Hintergrund `red-50`, Text `red-900`
- Ausgewählt (vor Prüfung): Rahmen `primary-600`, Hintergrund `primary-50`, Text `primary-900`
- Nicht gewählt, nach Prüfung: `slate-200` Rahmen, keine Füllung (gedimmt)

### Admin-Theme (separat)
- Eigene Neutralfarbe `--color-admin: #454545` ersetzt im Admin-Bereich die Primärfarbe (`html.admin-theme`). Eigenständiges Thema, folgt nicht den Farbregeln dieses Dokuments.
- Übernimmt aber Chunky-Border, Radius- und Neutralpalette-Regeln (Slate statt Gray) von oben — nur die Akzentfarbe wechselt von `primary` zu `admin`.

**Buttons im Admin-Bereich** — drei Größen, konsequent per `inline-flex items-center justify-center`, nie per reinem `py-*` zentriert. Die Standard-Größe übernimmt exakt die Proportionen des primären Guest-Buttons (siehe „Buttons" oben, z. B. „Weiter"/„Prüfen" im Quiz) — nur die Akzentfarbe wechselt zu `admin`:

| Größe | Klassen | Verwendung |
|---|---|---|
| Standard | `h-10 sm:h-11 px-8 rounded-lg border-2 border-b-4 text-base font-semibold` | Primäre Aktionen (Speichern, Erstellen, „Frage hinzufügen"-Link, Formular-CTAs) |
| Medium | `h-9 px-4 rounded-lg border-2 border-b-4 text-sm font-medium` | Freistehende sekundäre Aktionen mit eigenem Platz, die nicht mit dem primären CTA konkurrieren sollen (z. B. Ändern/Entfernen unter einem Bild-Upload) |
| Kompakt | `h-8 px-3 rounded-lg border-2 border-b-4 text-xs font-medium` | Inline-Aktionen in engen Listenzeilen/Karten (Abbrechen/Hinzufügen neben einem Inline-Formular) |

- Primär (gefüllt): `btn-admin border-admin-800 text-white`
- Sekundär/neutral: `bg-white border-slate-300 text-slate-700 hover:bg-slate-50`
- Gefahr (löschen/entfernen): `bg-white border-red-200 text-red-500 hover:bg-red-50`
- Disabled: `opacity-60 cursor-not-allowed` (Standard/Medium) bzw. `opacity-50` (Kompakt)
- Icon-only Buttons (Papierkorb, Stift in Listenzeilen) bleiben unskaliert (`w-5 h-5`-Icon ohne Button-Box) — keine der beiden Größen erzwingen

## Typografie
- Schriftart: **Montserrat** (`font-montserrat`), auf dem Root-Element jeder Seite gesetzt
- Skalengröße folgt der Text-Hierarchie oben; zusätzlich:
  - Seitentitel: `text-3xl font-bold`
  - Eyebrow/Meta-Label: `text-xs font-semibold uppercase tracking-widest text-slate-400` (z. B. „Verfügbare Module")
  - Badge/Tag mit Farbakzent: `text-xs font-bold uppercase tracking-wider text-primary-500` (z. B. „Single Choice") — nur für kategorisierende Labels, nicht für neutrale Meta-Infos

## Rahmen & Formen — das Signature-Element
**Chunky Border**: `border-2 border-b-4` — 2px oben/seitlich, 4px unten. Erzeugt den charakteristischen 3D-„gedrückter Button"-Effekt dieser App. Gilt für: alle Buttons (primär & sekundär), Icon-Buttons im Header, Options-Kacheln im Quiz, Listen-Container (Modul-/Quiz-Übersicht).

- Rahmenfarbe = 800er-Schattierung der eigenen Hintergrundfarbe (z. B. `border-primary-800` auf `bg-primary`); auf weißen/neutralen Elementen `border-slate-300`
- Modals/Sheets sind die einzige bewusste Ausnahme (siehe unten)

Eckenradius:

| Radius | Wert | Verwendung |
|---|---|---|
| `rounded-full` | — | Avatare/Icon-Kreise, Radio-Indikator (Single Choice) |
| `rounded-lg` | 0.5rem | Buttons, Options-Kacheln, Checkbox-Indikator (Multiple Choice) |
| `rounded-xl` | 0.75rem | Karten/Listen-Container, Nav-Bar, Bilder |
| `rounded-2xl` | 1rem | Modals/Sheets |

Divider zwischen Listenzeilen: **`divide-y-2 divide-slate-200`** — die 2px-Stärke hält das Gewicht konsistent mit `border-2`.

## Buttons
- Primär: `bg-primary border-2 border-b-4 border-primary-800 text-white font-semibold rounded-lg hover:bg-primary-700`
- Sekundär/neutral: `bg-white border-2 border-b-4 border-slate-300 text-slate-700 hover:bg-slate-50`
- Disabled: `opacity-30 cursor-not-allowed`
- Höhe: `h-10 sm:h-11` für primäre Aktions-Buttons; kompakte Icon-Buttons `w-9 h-9` bis `w-10 h-10`
- Icon+Label (z. B. „Hinweis", „Erklärung"): Label bekommt `max-sm:hidden`, Icon bleibt immer sichtbar → Button bleibt auf Mobile kompakt

## Listen & Karten
Standard-Listen-Container (Modul-Übersicht, Quiz-Übersicht):
```html
<div class="border-2 border-b-4 border-slate-300 rounded-xl divide-y-2 divide-slate-200 overflow-hidden bg-white">
  <a class="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group">
    …
    <Icon icon="tabler:chevron-right" class="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
  </a>
</div>
```
- Trailing Chevron signalisiert Navigierbarkeit, färbt sich beim Hover primärfarben
- Icon-Kreis (z. B. Modul-Icon): `w-14 h-14 rounded-full bg-primary-100`

## Quiz- / Frage-Screen
- Dreizonen-Layout: (1) fixer Header mit Titel + Fortschritt, (2) scrollbarer Inhalt, (3) fixe Aktionsleiste unten (`border-t-2 border-slate-200`)
- Fortschrittsbalken: `h-1.5 bg-slate-200 rounded-full`, Füllung `bg-primary rounded-full transition-all duration-500`
- Options-Kacheln: immer `border-2 border-b-4`, Zustandsfarben wie oben unter „Statusfarben" definiert
- Checkbox-/Radio-Indikator links in jeder Option (20×20px), folgt demselben Zustandsschema wie die Kachel selbst

## Modals & Sheets — bewusste Ausnahme
InfoSheet (Hinweis/Erklärung) und Bild-Lightbox verzichten auf den Chunky-Border. Stattdessen: `rounded-2xl shadow-2xl`, schwebend über einem `bg-black/70 backdrop-blur-sm`-Overlay. Begründung: Modals liegen über einem Scrim statt im normalen Seitenfluss — ein weicher Schatten wirkt hier passender als ein Rahmen mit Bodenkante.

## Icons
Ausschließlich **Tabler Icons** über `@iconify/svelte` (`tabler:*`) — kein anderes Icon-Set mischen.

## Dark Mode
- Klassenbasiert (`html.dark`), manuell über `ThemeToggle` umschaltbar, unabhängig vom OS-Setting (bewusst **kein** Tailwind `dark:`-Media-Query-Variant)
- Konsistentes `dm-*`-Utility-Overlay-Pattern in `app.css`, statt verstreuter Dark-Klassen in einzelnen Komponenten
- Palette: Hintergrund `#0f1419`, Karte `#161d27`, erhöhte Karte `#1a2332`, Rahmen/Divider `#334155` (slate-700), Text primär `rgba(255,255,255,.87)`, Text sekundär `#94a3b8` (slate-400)
- Primärfarbe wird im Dark Mode entsättigt (`#1e6fb0` statt dem hellen ICDL-Blau), damit sie auf dunklem Grund nicht zu grell wirkt

## Sprache
Alle sichtbaren UI-Texte auf Deutsch.

---

## Bekannte Abweichungen (noch zu bereinigen)
Aktueller Code, der diesen Regeln noch nicht folgt:
- `gray-*` statt `slate-*` in: `+layout.svelte` (Header), `QuestionCard.svelte`, `question/Option.svelte`, `InfoSheet.svelte`, `QuizResult.svelte` (teilweise), Login-Seite
- Home-Seite (`/+page.svelte`) nutzt `divide-y` (1px) statt `divide-y-2`
- Feedback-Icon „Falsch" in `QuestionCard.svelte` nutzt `text-red-400` statt `red-500` (inkonsistent zur grünen Entsprechung `green-500`)
- Login-Seite nutzt noch dünne `border` (1px) + `shadow-sm` statt Chunky-Border — bislang nicht an diese Richtlinien angeglichen
