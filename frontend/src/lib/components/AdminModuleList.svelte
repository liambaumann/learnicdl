<script lang="ts">
    import Icon from '@iconify/svelte';
    import { enhance } from '$app/forms';
    import { dark } from '$lib/theme';
    import ConfirmDialog from './ConfirmDialog.svelte';
    export let modules: any[] = [];
    export let submodulesByModule: Record<string, any[]> = {};
    export let questionCountBySubmodule: Record<string, number> = {};
    export let optionCountBySubmodule: Record<string, number> = {};
    export let user: any;

    let deleteForms: Record<string, HTMLFormElement> = {};
    let pendingDelete: { id: string; title: string } | null = null;

    $: deleteMessage = (() => {
        if (!pendingDelete) return '';
        const questionCount = questionCountBySubmodule[pendingDelete.id] ?? 0;
        const optionCount = optionCountBySubmodule[pendingDelete.id] ?? 0;
        return questionCount
            ? `„${pendingDelete.title}“ inkl. ${questionCount} Frage${questionCount === 1 ? '' : 'n'} und ${optionCount} Antwortoption${optionCount === 1 ? '' : 'en'} unwiderruflich löschen?`
            : `„${pendingDelete.title}“ löschen? Enthält keine Fragen.`;
    })();

    function confirmDelete() {
        if (!pendingDelete) return;
        const id = pendingDelete.id;
        pendingDelete = null;
        deleteForms[id]?.requestSubmit();
    }

    let addingToModule: string | null = null;
    let newSubmoduleTitle = '';
    let addSubmitting = false;
    let addErrorByModule: Record<string, string> = {};

    function startAdd(moduleId: string) {
        addingToModule = moduleId;
        newSubmoduleTitle = '';
        addErrorByModule = { ...addErrorByModule, [moduleId]: '' };
    }

    function cancelAdd() {
        addingToModule = null;
        newSubmoduleTitle = '';
    }

    // Curried: use:enhance calls submitAdd(moduleId) once at render time to get
    // the actual pre-submit hook, which itself runs (and returns the post-submit
    // callback) on every submit - the moduleId closes over correctly either way.
    function submitAdd(moduleId: string) {
        return () => {
            addSubmitting = true;
            return async ({ result, update }: any) => {
                addSubmitting = false;
                if (result.type === 'failure') {
                    addErrorByModule = { ...addErrorByModule, [moduleId]: result.data?.message ?? 'Fehler beim Erstellen.' };
                    await update({ reset: false });
                    return;
                }
                addErrorByModule = { ...addErrorByModule, [moduleId]: '' };
                addingToModule = null;
                newSubmoduleTitle = '';
                await update();
            };
        };
    }
</script>

<div>
    <header class="mb-8">
        <h1 class="text-2xl md:text-4xl font-bold dm-text">Modul- und Quizübersicht</h1>
        <p class="text-gray-500 dm-text2 mt-2">Willkommen zurück, {user?.name}.</p>
        <p class="text-sm text-gray-400 dm-text3 mt-4">
            {modules.length} Module · {Object.values(submodulesByModule).reduce((c, arr) => c + arr.length, 0)} Quizze
        </p>
    </header>

    <div class="space-y-8">
        {#each modules as module}
            <section>
                <div class="flex items-center gap-4 px-3 py-2">
                    <div class="w-14 h-14 shrink-0 rounded-full bg-primary-100 flex items-center justify-center dm-icon-circle">
                        {#if module.icon}
                            <img src="/module_icons/{$dark ? 'dark' : 'cyan'}/{module.icon}.svg" alt="{module.title} icon" class="w-10 h-10" />
                        {:else}
                            <Icon icon="tabler:stack-2" class="w-10 h-10 text-primary" />
                        {/if}
                    </div>
                    <h2 class="text-lg md:text-xl font-bold text-slate-900 dm-text">{module.title}</h2>
                </div>

                <div class="mt-1">
                    {#each submodulesByModule[module.id] ?? [] as submodule}
                        <div class="flex items-center gap-2 rounded-lg pl-8 pr-3 transition-colors hover:bg-slate-50 group dm-hover">
                            <a
                                href="/admin/quiz/{submodule.id}"
                                class="flex items-center gap-3 flex-1 min-w-0 py-2.5"
                            >
                                <Icon icon="tabler:checkbox" class="h-5 w-5 text-admin shrink-0" />
                                <span class="flex-1 text-slate-700 dm-text2 truncate">{submodule.title}</span>
                                <Icon icon="tabler:chevron-right" class="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors dm-icon" />
                            </a>
                            <form
                                method="POST"
                                action={`/admin/quiz/${submodule.id}/delete-submodule`}
                                bind:this={deleteForms[submodule.id]}
                            >
                                <button
                                    type="button"
                                    on:click={() => (pendingDelete = { id: submodule.id, title: submodule.title })}
                                    class="text-red-500 hover:text-red-700 shrink-0"
                                    aria-label="Quiz löschen"
                                >
                                    <Icon icon="tabler:trash" class="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    {:else}
                        <p class="px-3 py-2 pl-8 text-sm text-gray-400 dm-text3">Keine Quizze in diesem Modul.</p>
                    {/each}

                    {#if addingToModule === module.id}
                        <form
                            method="POST"
                            action="?/createSubmodule"
                            use:enhance={submitAdd(module.id)}
                            class="flex items-center gap-2 pl-8 pr-3 py-2"
                        >
                            <input type="hidden" name="module" value={module.id} />
                            <input
                                name="title"
                                required
                                autofocus
                                placeholder="Titel des neuen Quiz"
                                bind:value={newSubmoduleTitle}
                                class="flex-1 min-w-0 border border-gray-300 rounded px-2 py-1.5 text-sm dm-input"
                            />
                            <button
                                type="button"
                                on:click={cancelAdd}
                                class="shrink-0 inline-flex items-center justify-center h-8 px-3 rounded-lg text-xs font-medium text-slate-700 bg-white border-2 border-b-4 border-slate-300 hover:bg-slate-50 transition-colors dm-result-btn"
                            >
                                Abbrechen
                            </button>
                            <button
                                type="submit"
                                disabled={addSubmitting}
                                class="shrink-0 inline-flex items-center justify-center h-8 px-3 rounded-lg text-xs font-medium border-2 border-b-4 border-admin-800 text-white btn-admin disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {addSubmitting ? 'Speichert…' : 'Hinzufügen'}
                            </button>
                        </form>
                        {#if addErrorByModule[module.id]}
                            <p class="pl-8 pr-3 pb-2 text-xs text-red-500">{addErrorByModule[module.id]}</p>
                        {/if}
                    {:else}
                        <button
                            type="button"
                            on:click={() => startAdd(module.id)}
                            class="flex items-center gap-3 w-full text-left pl-8 pr-3 py-2.5 text-slate-400 hover:text-admin transition-colors dm-text3"
                        >
                            <Icon icon="tabler:plus" class="h-5 w-5 shrink-0" />
                            <span class="text-sm">Quiz hinzufügen</span>
                        </button>
                    {/if}
                </div>
            </section>
        {/each}
    </div>
</div>

<ConfirmDialog
    open={pendingDelete !== null}
    title="Quiz löschen"
    message={deleteMessage}
    confirmLabel="Löschen"
    cancelLabel="Abbrechen"
    onConfirm={confirmDelete}
    onCancel={() => (pendingDelete = null)}
/>
