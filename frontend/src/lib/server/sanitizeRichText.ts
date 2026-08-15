import sanitizeHtml from 'sanitize-html';
import { HUE_VALUES } from '$lib/tiptap/hue-mark';

// Allowlist mirrors exactly what RichTextEditor.svelte can produce (see
// lib/tiptap/hue-mark.ts for the color classes and the Link extension config
// for href handling). hint/explanation are rendered elsewhere via {@html}
// with no other sanitization in the pipeline, so this is the only guard.
export const sanitizeRichText = (html: string) =>
    sanitizeHtml(html, {
        allowedTags: ['p', 'strong', 'em', 'span', 'a', 'ul', 'ol', 'li'],
        allowedAttributes: {
            span: ['class'],
            a: ['href', 'target', 'rel']
        },
        allowedClasses: { span: HUE_VALUES.map((hue) => `hue-${hue}`) },
        allowedSchemes: ['http', 'https', 'mailto'],
        disallowedTagsMode: 'discard'
    });
