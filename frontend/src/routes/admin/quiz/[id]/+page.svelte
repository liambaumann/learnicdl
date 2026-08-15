<script lang="ts">
    import type { PageData } from './$types';
    import Icon from '@iconify/svelte';

    let { data }: { data: PageData } = $props();
</script>

<div class="max-w-4xl mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-2xl font-bold dm-text">Quiz: {data.submodule.title}</h1>
            <p class="text-sm text-gray-500 dm-text2">{data.submodule.description}</p>
        </div>
        <a href="/admin/quiz/{data.submodule.id}/add" class="inline-flex items-center justify-center h-10 sm:h-11 px-8 rounded-lg border-2 border-b-4 border-admin-800 btn-admin text-white text-base font-semibold transition-colors">Add Question</a>
    </div>

    <div class="bg-white border-2 border-gray-200 rounded-xl overflow-hidden dm-card">
        {#if data.questions.length}
            {#each data.questions as q}
                <div class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-200 last:border-b-0 dm-hover dm-border">
                    <a href="/admin/question/{q.id}" class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded bg-gray-100 flex items-center justify-center dm-admin-icon-bg">
                            {#if q.question_image}
                                <Icon icon="tabler:image" class="w-4 h-4 text-gray-500 dm-text2" />
                            {:else}
                                <Icon icon="tabler:file-text" class="w-4 h-4 text-gray-500 dm-text2" />
                            {/if}
                        </div>
                        <div>
                            <div class="font-medium dm-text">{q.question}</div>
                            <div class="text-xs text-gray-400 dm-text3">{q.type}</div>
                        </div>
                    </a>
                    <div class="flex items-center gap-3">
                        <a href="/admin/question/{q.id}" class="text-gray-400 hover:text-gray-600 dm-icon dm-icon-close">
                            <Icon icon="tabler:edit" class="w-5 h-5" />
                        </a>
                        <form method="POST" action={`/admin/quiz/${data.submodule.id}/delete`} on:submit={(e) => {
                            const optionCount = data.optionCounts[q.id] ?? 0;
                            const msg = optionCount
                                ? `Delete this question and its ${optionCount} answer option${optionCount === 1 ? '' : 's'}?`
                                : 'Delete this question?';
                            if (!confirm(msg)) e.preventDefault();
                        }}>
                            <input type="hidden" name="questionId" value={q.id} />
                            <button type="submit" name="_action" value="delete" class="text-red-500 hover:text-red-700">
                                <Icon icon="tabler:trash" class="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            {/each}
        {:else}
            <div class="p-6 text-gray-500 dm-text2">No questions yet.</div>
        {/if}
    </div>
</div>
