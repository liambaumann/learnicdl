<script lang="ts">
    import { enhance } from '$app/forms';
    import ImageUploadField from '$lib/components/ImageUploadField.svelte';
    let { form = null }: { form: any } = $props();

    let selectedType = $state<string>('single_choice');
    let status = $state<'idle' | 'loading' | 'error'>('idle');
    let succeeded = $state(false);
    let quizId = $state('');

    function submitHandler() {
        status = 'loading';
        return async ({ result, update }: any) => {
            await update({ reset: false });
            if (result.type === 'success' && result.data?.success) {
                succeeded = true;
                quizId = result.data.quizId;
            } else {
                status = 'error';
            }
        };
    }

    function addAnother() {
        succeeded = false;
        status = 'idle';
        selectedType = 'single_choice';
    }
</script>

<!-- Add Question Page -->

<div class="max-w-4xl mx-auto p-6">
    <div class="mb-4">
        <h1 class="text-2xl font-bold">Add Question</h1>
        <p class="text-xs text-gray-400 mt-1">* required field</p>
    </div>

    {#if succeeded}
        <div class="rounded-xl border-2 border-green-200 bg-green-50 p-6 text-center space-y-4">
            <p class="text-green-700 font-semibold text-lg">Question created successfully.</p>
            <div class="flex justify-center gap-3">
                <button onclick={addAnother} class="btn-admin px-4 py-2 rounded">Add Another</button>
                <a href="/admin/quiz/{quizId}" class="px-4 py-2 rounded border-2 border-gray-300 bg-white hover:bg-gray-50 transition-colors">Back to Quiz</a>
            </div>
        </div>
    {:else}
        <form method="POST" enctype="multipart/form-data" use:enhance={submitHandler} class="space-y-4">
            {#if form?.error}
                <p class="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{form.message}</p>
            {/if}

            <div>
                <label class="block text-sm font-medium">Question Text *</label>
                <input name="text" required class="w-full border border-gray-200 rounded px-3 py-2 shadow-sm" />
            </div>

            <div>
                <label class="block text-sm font-medium">Type</label>
                <select name="type" bind:value={selectedType} class="w-full border border-gray-200 rounded px-3 py-2 shadow-sm">
                    <option value="single_choice">Single Choice</option>
                    <option value="multiple_choice">Multiple Choice</option>
                </select>
            </div>

            <div>
                <p class="block text-sm font-medium mb-1">Image</p>
                <ImageUploadField name="question_image" />
            </div>

            <div>
                <label class="block text-sm font-medium">Hint</label>
                <textarea name="hint" rows="2" class="w-full border border-gray-200 rounded px-3 py-2 shadow-sm"></textarea>
            </div>

            <div>
                <p class="block text-sm font-medium mb-1">Hint Image</p>
                <ImageUploadField name="hint_image" />
            </div>

            <div>
                <label class="block text-sm font-medium">Explanation</label>
                <textarea name="explanation" rows="2" class="w-full border border-gray-200 rounded px-3 py-2 shadow-sm"></textarea>
            </div>

            <div>
                <p class="block text-sm font-medium mb-1">Explanation Image</p>
                <ImageUploadField name="explanation_image" />
            </div>

        <fieldset class="mt-2">
                <legend class="font-medium mb-2">Answer Options (all required)</legend>
                {#each Array(4) as _, i}
                    <div class="flex items-center gap-3 mb-2">
                        <input name={`option_${i}`} placeholder={`Option ${i + 1}`} class="flex-1 border border-gray-200 rounded px-3 py-2 shadow-sm" required />
                        <label class="inline-flex items-center gap-2 text-sm">
                            <input type="radio" name="correct" value={String(i)} class:hidden={selectedType !== 'single_choice'} />
                            <input type="checkbox" name={`correct_${i}`} class:hidden={selectedType === 'single_choice'} />
                            <span>Correct</span>
                        </label>
                    </div>
                {/each}
            </fieldset>

            <div>
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    class="px-4 py-2 rounded transition-colors disabled:cursor-not-allowed
                        {status === 'loading' ? 'btn-admin opacity-60' : 'btn-admin'}"
                >
                    {status === 'loading' ? 'Creating...' : 'Create'}
                </button>
            </div>
        </form>
    {/if}
</div>
