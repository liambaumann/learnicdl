<script lang="ts">
    import { enhance } from '$app/forms';
    import type { PageData } from './$types';
    import QuestionFormFields from '$lib/components/QuestionFormFields.svelte';

    let { data, form }: { data: PageData; form: any } = $props();
    let { question, options } = data;

    let isDirty = $state(false);
    let loading = $state(false);
    let successMessage = $state('');

    function markDirty() { isDirty = true; }

    function submitHandler() {
        loading = true;
        return async ({ result, update }: any) => {
            await update({ reset: false });
            loading = false;
            if (result.type === 'success') {
                isDirty = false;
                successMessage = 'Änderungen gespeichert.';
                setTimeout(() => { successMessage = ''; }, 3000);
            }
        };
    }
</script>

<div class="max-w-4xl mx-auto p-6">
    <header class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dm-text">Frage bearbeiten</h1>
        <p class="text-xs text-slate-400 dm-text3 mt-1">* Pflichtfeld</p>
    </header>

    <form method="POST" enctype="multipart/form-data" use:enhance={submitHandler} class="space-y-6">
        {#if form?.error}
            <p class="text-sm text-red-900 bg-red-50 border-2 border-b-4 border-red-500 rounded-lg px-4 py-2">{form.message}</p>
        {/if}

        <QuestionFormFields
            questionText={question.question}
            initialType={question.type}
            initialHint={question.hint}
            initialExplanation={question.explanation}
            options={options.map((opt: any) => ({ id: opt.id, text: opt.text, is_correct: opt.is_correct }))}
            imageUrl={data.imageUrl}
            hintImageUrl={data.hintImageUrl}
            explanationImageUrl={data.explanationImageUrl}
            onchange={markDirty}
        />

        <div class="flex items-center gap-4">
            <button
                type="submit"
                disabled={!isDirty || loading}
                class="inline-flex items-center justify-center h-10 sm:h-11 px-8 rounded-lg border-2 border-b-4 text-base font-semibold transition-colors
                    {!isDirty || loading
                        ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed opacity-60'
                        : 'btn-admin border-admin-800 text-white'}"
            >
                {loading ? 'Speichert…' : 'Speichern'}
            </button>
            <p class="text-sm text-green-700 dm-feedback-ok transition-opacity duration-300 {successMessage ? 'opacity-100' : 'opacity-0'}">
                {successMessage || 'placeholder'}
            </p>
        </div>
    </form>
</div>
