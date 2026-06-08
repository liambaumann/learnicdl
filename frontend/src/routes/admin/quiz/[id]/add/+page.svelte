<script lang="ts">
    import { enhance } from '$app/forms';
    export let form: any = null;
    let selectedType: string = form?.type ?? 'single_choice';
</script>

<!-- Add Question Page -->

<div class="max-w-4xl mx-auto p-6">
    <div class="mb-4">
        <div class="text-admin text-3xl md:text-4xl font-extrabold uppercase tracking-widest mb-1">(admin)</div>
        <h1 class="text-2xl font-bold">Add Question</h1>
    </div>

    <form method="POST" use:enhance class="space-y-4">
        {#if form?.error}
            <p class="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{form.message}</p>
        {/if}

        <div>
            <label class="block text-sm font-medium">Question Text</label>
            <input name="text" required class="w-full border border-gray-200 rounded px-3 py-2 shadow-sm" />
        </div>

        <div>
            <label class="block text-sm font-medium">Type</label>
            <div class="flex items-center gap-3">
                <select name="type" bind:value={selectedType} class="w-full border border-gray-200 rounded px-3 py-2 shadow-sm">
                    <option value="single_choice">Single Choice</option>
                    <option value="multiple_choice">Multiple Choice</option>
                </select>
                
            </div>
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
            <button type="submit" class="btn-admin px-4 py-2 rounded">Create</button>
        </div>
    </form>
</div>
