<script lang="ts">
    import type { PageData } from './$types';

    // Receive the data that +page.ts returned
    let { data }: { data: PageData } = $props();
</script>

<div class="max-w-4xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-bold mb-6">Available Quizzes</h1>
    
    <div class="grid gap-4">
        {#each data.quizzes as quiz}
            <a href="/quiz/{quiz.id}" class="block p-6 bg-white border rounded hover:bg-gray-50">
                <h2 class="text-xl font-bold">{quiz.title}</h2>
                <p>{quiz.description}</p>
            </a>
        {/each}
    </div>
</div>