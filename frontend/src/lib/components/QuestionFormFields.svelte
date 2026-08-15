<script lang="ts">
    import ImageUploadField from './ImageUploadField.svelte';
    import RichTextEditor from './RichTextEditor.svelte';

    type OptionInput = { id?: string; text?: string; is_correct?: boolean };

    let {
        questionText = '',
        initialType = 'single_choice',
        initialHint = '',
        initialExplanation = '',
        options = [{}, {}, {}, {}],
        imageUrl = '',
        hintImageUrl = '',
        explanationImageUrl = '',
        optionsLegend = 'Antwortoptionen *',
        onchange
    }: {
        questionText?: string;
        initialType?: string;
        initialHint?: string;
        initialExplanation?: string;
        options?: OptionInput[];
        imageUrl?: string;
        hintImageUrl?: string;
        explanationImageUrl?: string;
        optionsLegend?: string;
        onchange?: () => void;
    } = $props();

    // Local state, seeded once from the initial* props: this component is fully
    // remounted (not diffed) whenever the parent needs a fresh form, e.g. after
    // switching the {#if succeeded} branch back on the add-question page.
    let type = $state(initialType);
    let hint = $state(initialHint);
    let explanation = $state(initialExplanation);
</script>

<div class="space-y-6">
    <section class="bg-white border-2 border-b-4 border-slate-300 rounded-xl p-5 space-y-4 dm-card dm-border">
        <div>
            <label for="qff-text" class="block text-sm font-semibold text-slate-700 dm-text2 mb-1">Fragetext *</label>
            <input
                id="qff-text"
                name="text"
                value={questionText}
                required
                oninput={onchange}
                class="w-full h-10 border-2 border-slate-300 rounded-lg px-3 text-slate-900 focus:outline-none focus:border-admin transition-colors dm-input dm-border dm-text"
            />
        </div>

        <div>
            <label for="qff-type" class="block text-sm font-semibold text-slate-700 dm-text2 mb-1">Typ *</label>
            <select
                id="qff-type"
                name="type"
                bind:value={type}
                onchange={onchange}
                class="w-full h-10 border-2 border-slate-300 rounded-lg px-3 text-slate-900 focus:outline-none focus:border-admin transition-colors dm-input dm-border dm-text"
            >
                <option value="single_choice">Single Choice</option>
                <option value="multiple_choice">Multiple Choice</option>
            </select>
        </div>

        <div>
            <p class="block text-sm font-semibold text-slate-700 dm-text2 mb-1">Bild (optional)</p>
            <ImageUploadField name="question_image" existingUrl={imageUrl} {onchange} />
        </div>
    </section>

    <fieldset class="bg-white border-2 border-b-4 border-slate-300 rounded-xl p-5 dm-card dm-border">
        <legend class="text-sm font-semibold text-slate-700 dm-text2 px-1">{optionsLegend}</legend>
        <div class="space-y-2 mt-2">
            {#each options as opt, i}
                {#if opt.id}
                    <input type="hidden" name="option_id_{i}" value={opt.id} />
                {/if}
                <div class="flex items-center gap-3">
                    <input
                        name="option_text_{i}"
                        value={opt.text ?? ''}
                        placeholder={`Option ${i + 1}`}
                        required
                        oninput={onchange}
                        class="flex-1 h-10 border-2 border-slate-300 rounded-lg px-3 text-slate-900 focus:outline-none focus:border-admin transition-colors dm-input dm-border dm-text"
                    />
                    <label class="inline-flex items-center gap-2 text-sm text-slate-700 dm-text2 shrink-0">
                        {#if type === 'single_choice'}
                            <input type="radio" name="correct" value={String(i)} checked={!!opt.is_correct} onchange={onchange} class="accent-admin w-4 h-4" />
                        {:else}
                            <input type="checkbox" name="correct_{i}" checked={!!opt.is_correct} onchange={onchange} class="accent-admin w-4 h-4" />
                        {/if}
                        <span>Korrekt</span>
                    </label>
                </div>
            {/each}
        </div>
    </fieldset>

    <section class="bg-white border-2 border-b-4 border-slate-300 rounded-xl p-5 space-y-4 dm-card dm-border">
        <div>
            <label for="qff-hint" class="block text-sm font-semibold text-slate-700 dm-text2 mb-1">Hinweis (optional)</label>
            <RichTextEditor name="hint" bind:value={hint} {onchange} />
        </div>

        <div>
            <p class="block text-sm font-semibold text-slate-700 dm-text2 mb-1">Hinweisbild (optional)</p>
            <ImageUploadField name="hint_image" existingUrl={hintImageUrl} {onchange} />
        </div>
    </section>

    <section class="bg-white border-2 border-b-4 border-slate-300 rounded-xl p-5 space-y-4 dm-card dm-border">
        <div>
            <label for="qff-explanation" class="block text-sm font-semibold text-slate-700 dm-text2 mb-1">Erklärung (optional)</label>
            <RichTextEditor name="explanation" bind:value={explanation} {onchange} />
        </div>

        <div>
            <p class="block text-sm font-semibold text-slate-700 dm-text2 mb-1">Erklärungsbild (optional)</p>
            <ImageUploadField name="explanation_image" existingUrl={explanationImageUrl} {onchange} />
        </div>
    </section>
</div>
