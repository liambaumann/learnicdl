<script lang="ts">
    import { enhance } from '$app/forms';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    let { question, options } = data;
</script>

<!-- Edit Question Page -->

<div class="max-w-4xl mx-auto p-6">
    <div class="text-admin text-3xl md:text-4xl font-extrabold uppercase tracking-widest mb-3">(admin)</div>
    <h1 class="text-2xl font-bold mb-4">Edit Question</h1>

    <form method="POST" use:enhance class="space-y-4">
        <div>
            <label class="block text-sm font-medium">Question Text</label>
            <input name="text" value={question.text} required class="w-full border border-gray-200 rounded px-3 py-2 shadow-sm" />
        </div>

        <div>
            <label class="block text-sm font-medium">Type</label>
            <select name="type" value={question.type} class="w-full border border-gray-200 rounded px-3 py-2 shadow-sm">
                <option value="single_choice">Single Choice</option>
                <option value="multiple_choice">Multiple Choice</option>
            </select>
        </div>

        <div>
            <h2 class="font-semibold">Options</h2>
            {#if options.length}
                <ul class="mt-2 space-y-2">
                    {#each options as opt}
                        <li class="flex items-center justify-between border border-gray-200 rounded p-2 bg-white">
                            <div class="text-sm">{opt.text}</div>
                            {#if opt.is_correct}
                                <div class="text-xs text-green-600">Correct</div>
                            {/if}
                        </li>
                    {/each}
                </ul>
            {:else}
                <div class="text-gray-500">No options available.</div>
            {/if}
        </div>

        <button type="submit" class="btn-admin px-4 py-2 rounded">Update and Save</button>
    </form>
</div>
