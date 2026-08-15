<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import type { Readable } from 'svelte/store';
    import { createEditor, EditorContent, type Editor } from 'svelte-tiptap';
    import Document from '@tiptap/extension-document';
    import Paragraph from '@tiptap/extension-paragraph';
    import Text from '@tiptap/extension-text';
    import Bold from '@tiptap/extension-bold';
    import Italic from '@tiptap/extension-italic';
    import History from '@tiptap/extension-history';
    import Link from '@tiptap/extension-link';
    import BulletList from '@tiptap/extension-bullet-list';
    import OrderedList from '@tiptap/extension-ordered-list';
    import ListItem from '@tiptap/extension-list-item';
    import Icon from '@iconify/svelte';
    import { Hue, HUE_VALUES } from '$lib/tiptap/hue-mark';

    let {
        name,
        value = $bindable(''),
        onchange
    }: {
        name: string;
        value?: string;
        onchange?: () => void;
    } = $props();

    let editor = $state<Readable<Editor>>();

    onMount(() => {
        editor = createEditor({
            extensions: [
                Document,
                Paragraph,
                Text,
                Bold,
                Italic,
                History,
                Hue,
                BulletList,
                OrderedList,
                ListItem,
                Link.configure({
                    openOnClick: false,
                    autolink: false,
                    protocols: ['http', 'https', 'mailto'],
                    HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' }
                })
            ],
            content: value,
            onUpdate: ({ editor: e }) => {
                value = e.getHTML();
                onchange?.();
            }
        });
    });

    onDestroy(() => $editor?.destroy());

    function setLink() {
        if (!$editor) return;
        const previousUrl = $editor.getAttributes('link').href as string | undefined;
        const url = window.prompt('URL', previousUrl ?? 'https://');
        if (url === null) return;
        if (url === '') {
            $editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        $editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
</script>

<input type="hidden" {name} {value} />

<div class="rte-shell rounded-lg border-2 border-slate-300 dm-border dm-card focus-within:border-admin transition-colors overflow-hidden">
    <div class="rte-toolbar flex items-center gap-1 flex-wrap px-2 py-1.5 border-b-2 border-slate-200 dm-border">
        <button
            type="button"
            class="rte-btn"
            class:rte-btn-active={$editor?.isActive('bold')}
            onclick={() => $editor?.chain().focus().toggleBold().run()}
            aria-label="Bold"
            aria-pressed={$editor?.isActive('bold') ?? false}
        >
            <Icon icon="tabler:bold" width="16" height="16" />
        </button>
        <button
            type="button"
            class="rte-btn"
            class:rte-btn-active={$editor?.isActive('italic')}
            onclick={() => $editor?.chain().focus().toggleItalic().run()}
            aria-label="Italic"
            aria-pressed={$editor?.isActive('italic') ?? false}
        >
            <Icon icon="tabler:italic" width="16" height="16" />
        </button>
        <button
            type="button"
            class="rte-btn"
            class:rte-btn-active={$editor?.isActive('link')}
            onclick={setLink}
            aria-label="Link"
            aria-pressed={$editor?.isActive('link') ?? false}
        >
            <Icon icon="tabler:link" width="16" height="16" />
        </button>

        <span class="rte-sep"></span>

        <button
            type="button"
            class="rte-btn"
            class:rte-btn-active={$editor?.isActive('bulletList')}
            onclick={() => $editor?.chain().focus().toggleBulletList().run()}
            aria-label="Bullet list"
            aria-pressed={$editor?.isActive('bulletList') ?? false}
        >
            <Icon icon="tabler:list" width="16" height="16" />
        </button>
        <button
            type="button"
            class="rte-btn"
            class:rte-btn-active={$editor?.isActive('orderedList')}
            onclick={() => $editor?.chain().focus().toggleOrderedList().run()}
            aria-label="Numbered list"
            aria-pressed={$editor?.isActive('orderedList') ?? false}
        >
            <Icon icon="tabler:list-numbers" width="16" height="16" />
        </button>

        <span class="rte-sep"></span>

        {#each HUE_VALUES as hue (hue)}
            <button
                type="button"
                class="rte-swatch"
                class:rte-swatch-active={$editor?.isActive('hue', { hue })}
                style="background-color: var(--hue-{hue})"
                onclick={() => $editor?.chain().focus().setHue(hue).run()}
                aria-label={`Color: ${hue}`}
                aria-pressed={$editor?.isActive('hue', { hue }) ?? false}
            ></button>
        {/each}
        <button
            type="button"
            class="rte-btn"
            onclick={() => $editor?.chain().focus().unsetHue().run()}
            aria-label="Clear color"
        >
            <Icon icon="tabler:letter-x" width="16" height="16" />
        </button>
    </div>

    {#if $editor}
        <EditorContent editor={$editor} class="rte-content" />
    {/if}
</div>
