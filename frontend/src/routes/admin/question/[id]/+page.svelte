<script lang="ts">
    import { enhance } from '$app/forms';
    import type { PageData } from './$types';
    import ImageUploadField from '$lib/components/ImageUploadField.svelte';

    let { data, form }: { data: PageData; form: any } = $props();
    let { question, options } = data;

    let selectedType = $state<string>(question.type);
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
                successMessage = 'Changes saved successfully.';
                setTimeout(() => { successMessage = ''; }, 3000);
            }
        };
    }
</script>

<!-- Edit Question Page -->


<div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-1">Edit Question</h1>
    <p class="text-xs text-gray-400 mb-4">* required field</p>

    <form method="POST" enctype="multipart/form-data" use:enhance={submitHandler} class="space-y-4">
        {#if form?.error}
            <p class="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{form.message}</p>
        {/if}

        <div>
            <label class="block text-sm font-medium">Question Text *</label>
            <input name="text" value={question.question} required oninput={markDirty} class="w-full border border-gray-200 rounded px-3 py-2 shadow-sm" />
        </div>

        <div>
            <label class="block text-sm font-medium">Type</label>
            <select name="type" bind:value={selectedType} onchange={markDirty} class="w-full border border-gray-200 rounded px-3 py-2 shadow-sm">
                <option value="single_choice">Single Choice</option>
                <option value="multiple_choice">Multiple Choice</option>
            </select>
        </div>

        <div>
            <p class="block text-sm font-medium mb-1">Image</p>
            <ImageUploadField name="question_image" existingUrl={data.imageUrl} onchange={markDirty} />
        </div>

        <div>
            <label class="block text-sm font-medium">Hint</label>
            <textarea name="hint" oninput={markDirty} rows="2" class="w-full border border-gray-200 rounded px-3 py-2 shadow-sm">{question.hint}</textarea>
        </div>

        <div>
            <p class="block text-sm font-medium mb-1">Hint Image</p>
            <ImageUploadField name="hint_image" existingUrl={data.hintImageUrl} onchange={markDirty} />
        </div>

        <div>
            <label class="block text-sm font-medium">Explanation</label>
            <textarea name="explanation" oninput={markDirty} rows="2" class="w-full border border-gray-200 rounded px-3 py-2 shadow-sm">{question.explanation}</textarea>
        </div>

        <div>
            <p class="block text-sm font-medium mb-1">Explanation Image</p>
            <ImageUploadField name="explanation_image" existingUrl={data.explanationImageUrl} onchange={markDirty} />
        </div>

        <fieldset class="mt-2">
            <legend class="font-medium mb-2">Answer Options *</legend>
            {#each options as opt, i}
                <input type="hidden" name="option_id_{i}" value={opt.id} />
                <div class="flex items-center gap-3 mb-2">
                    <input
                        name="option_text_{i}"
                        value={opt.text}
                        required
                        oninput={markDirty}
                        class="flex-1 border border-gray-200 rounded px-3 py-2 shadow-sm"
                    />
                    <label class="inline-flex items-center gap-2 text-sm">
                        {#if selectedType === 'single_choice'}
                            <input type="radio" name="correct" value={opt.id} checked={opt.is_correct} onchange={markDirty} />
                        {:else}
                            <input type="checkbox" name="correct_{opt.id}" checked={opt.is_correct} onchange={markDirty} />
                        {/if}
                        <span>Correct</span>
                    </label>
                </div>
            {/each}
        </fieldset>

        <div class="space-y-2">
            <button
                type="submit"
                disabled={!isDirty || loading}
                class="px-4 py-2 rounded transition-colors
                    {!isDirty || loading
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'btn-admin'}"
            >
                {loading ? 'Saving...' : 'Update and Save'}
            </button>
            <p class="text-sm text-green-600 transition-opacity duration-300 {successMessage ? 'opacity-100' : 'opacity-0'}">
                {successMessage || 'placeholder'}
            </p>
        </div>
    </form>
</div>
