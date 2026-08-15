<script lang="ts">
    import { enhance } from '$app/forms';
    import Icon from '@iconify/svelte';
    import QuestionFormFields from '$lib/components/QuestionFormFields.svelte';
    let { form = null }: { form: any } = $props();

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
    }
</script>

<div class="max-w-4xl mx-auto p-6">
    <header class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dm-text">Frage hinzufügen</h1>
        <p class="text-xs text-slate-400 dm-text3 mt-1">* Pflichtfeld</p>
    </header>

    {#if succeeded}
        <div class="rounded-xl border-2 border-b-4 border-green-500 bg-green-50 p-8 text-center space-y-4">
            <Icon icon="tabler:circle-check" class="w-10 h-10 text-green-500 mx-auto" />
            <p class="text-green-900 font-semibold text-lg">Frage erfolgreich erstellt.</p>
            <div class="flex justify-center gap-3">
                <button onclick={addAnother} class="inline-flex items-center justify-center h-10 sm:h-11 px-8 rounded-lg btn-admin border-2 border-b-4 border-admin-800 text-white text-base font-semibold transition-colors">Weitere hinzufügen</button>
                <a href="/admin/quiz/{quizId}" class="inline-flex items-center justify-center h-10 sm:h-11 px-8 rounded-lg border-2 border-b-4 border-slate-300 bg-white text-slate-700 text-base font-semibold hover:bg-slate-50 transition-colors dm-card dm-hover dm-border dm-text2">Zurück zum Quiz</a>
            </div>
        </div>
    {:else}
        <form method="POST" enctype="multipart/form-data" use:enhance={submitHandler} class="space-y-6">
            {#if form?.error}
                <p class="text-sm text-red-900 bg-red-50 border-2 border-b-4 border-red-500 rounded-lg px-4 py-2">{form.message}</p>
            {/if}

            <QuestionFormFields />

            <div>
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    class="inline-flex items-center justify-center h-10 sm:h-11 px-8 rounded-lg border-2 border-b-4 border-admin-800 text-white text-base font-semibold transition-colors disabled:cursor-not-allowed
                        {status === 'loading' ? 'btn-admin opacity-60' : 'btn-admin'}"
                >
                    {status === 'loading' ? 'Erstellt…' : 'Erstellen'}
                </button>
            </div>
        </form>
    {/if}
</div>
