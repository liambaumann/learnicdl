import { Mark, mergeAttributes } from '@tiptap/core';

// Single source of truth for the restricted color palette — CSS values live
// in frontend/src/app.css (--hue-* custom properties), the server-side
// sanitizer allowlist in +page.server.ts reads this same list.
export const HUE_VALUES = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray'] as const;
export type HueValue = (typeof HUE_VALUES)[number];

function hueFromClassList(classList: DOMTokenList): HueValue | null {
    for (const className of classList) {
        const match = /^hue-(\w+)$/.exec(className)?.[1];
        if (match && (HUE_VALUES as readonly string[]).includes(match)) {
            return match as HueValue;
        }
    }
    return null;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        hue: {
            setHue: (hue: HueValue) => ReturnType;
            unsetHue: () => ReturnType;
        };
    }
}

// Renders/parses as `<span class="hue-*">`, never an inline color style.
// Any class or color outside HUE_VALUES is rejected on both parse and render,
// so pasted content or hand-edited HTML can't introduce arbitrary colors.
export const Hue = Mark.create({
    name: 'hue',

    // Legacy content merges color and bold onto the same element (e.g.
    // <strong class="hue-green">), so this mark's parse rule must run before
    // — and not exclusively consume — Bold/Italic's own <strong>/<em> rules,
    // otherwise whichever rule Tiptap tries first "wins" the element and the
    // other mark is silently dropped. Higher priority makes this rule get
    // tried first regardless of extension registration order; consuming:
    // false (below) tells the parser to keep looking for further matches
    // (Bold's rule) on the same element instead of stopping here.
    priority: 1000,

    addAttributes() {
        return {
            hue: {
                default: null,
                renderHTML: (attributes) => {
                    const hue = attributes.hue as HueValue | null;
                    if (!hue || !(HUE_VALUES as readonly string[]).includes(hue)) return {};
                    return { class: `hue-${hue}` };
                }
            }
        };
    },

    parseHTML() {
        return [
            {
                // Legacy content applies hue-* classes to whatever tag the
                // original inline style was on (e.g. <strong class="hue-green">),
                // not just <span> — match any element and let getAttrs reject
                // anything without a recognized hue-* class. This mark's own
                // renderHTML always writes a canonical <span>, so re-saving
                // normalizes the tag while other marks (Bold, Italic) still
                // parse the same element independently and stack correctly.
                tag: '*',
                consuming: false,
                getAttrs: (element) => {
                    if (!(element instanceof HTMLElement)) return false;
                    const hue = hueFromClassList(element.classList);
                    return hue ? { hue } : false;
                }
            }
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes), 0];
    },

    addCommands() {
        return {
            setHue:
                (hue: HueValue) =>
                ({ commands }) =>
                    commands.setMark(this.name, { hue }),
            unsetHue:
                () =>
                ({ commands }) =>
                    commands.unsetMark(this.name)
        };
    }
});
