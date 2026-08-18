<script lang="ts">
    import Icon from '@iconify/svelte';
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { dark } from '$lib/theme';
    import ConfirmDialog from './ConfirmDialog.svelte';
    export let modules: any[] = [];
    export let submodulesByModule: Record<string, any[]> = {};
    export let questionCountBySubmodule: Record<string, number> = {};
    export let user: any;
    export let searchQuery: string = '';
    export let matchingSubmoduleIds: string[] | null = null;

    let searchInput = searchQuery;
    let debounceTimer: ReturnType<typeof setTimeout>;

    function onSearchInput() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const url = new URL(page.url);
            if (searchInput.trim()) url.searchParams.set('q', searchInput.trim());
            else url.searchParams.delete('q');
            goto(url, { keepFocus: true, replaceState: true, noScroll: true });
        }, 300);
    }

    function clearSearch() {
        searchInput = '';
        onSearchInput();
    }

    $: totalMatches = matchingSubmoduleIds
        ? modules.reduce(
              (sum, m) =>
                  sum +
                  (submodulesByModule[m.id] ?? []).filter((s) => matchingSubmoduleIds!.includes(s.id)).length,
              0
          )
        : 0;

    let deleteForms: Record<string, HTMLFormElement> = {};
    let pendingDelete: { id: string; title: string } | null = null;

    function escapeHtml(str: string) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    $: deleteMessage = (() => {
        if (!pendingDelete) return '';
        const questionCount = questionCountBySubmodule[pendingDelete.id] ?? 0;
        const title = escapeHtml(pendingDelete.title);
        return questionCount
            ? `„<strong>${title}</strong>“ mit <strong>${questionCount} Frage${questionCount === 1 ? '' : 'n'}</strong> und allen zugehörigen Antwortoptionen unwiderruflich löschen?`
            : `„<strong>${title}</strong>“ löschen? Enthält keine Fragen.`;
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

        <div class="relative mt-4 max-w-sm">
            <Icon icon="tabler:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dm-text3" />
            <input
                type="text"
                bind:value={searchInput}
                on:input={onSearchInput}
                placeholder="Fragen durchsuchen…"
                class="w-full border border-gray-300 rounded px-2 py-1.5 pl-9 pr-8 text-sm dm-input"
            />
            {#if searchInput}
                <button
                    type="button"
                    on:click={clearSearch}
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dm-text3"
                    aria-label="Suche zurücksetzen"
                >
                    <Icon icon="tabler:x" class="w-4 h-4" />
                </button>
            {/if}
        </div>
    </header>

    {#if matchingSubmoduleIds && totalMatches === 0}
        <p class="px-3 py-2 text-sm text-gray-400 dm-text3">Keine Fragen gefunden für „{searchQuery}“.</p>
    {/if}

    <div class="space-y-8">
        {#each modules as module}
            {@const visibleSubmodules = matchingSubmoduleIds
                ? (submodulesByModule[module.id] ?? []).filter((s) => matchingSubmoduleIds.includes(s.id))
                : (submodulesByModule[module.id] ?? [])}
            {#if !matchingSubmoduleIds || visibleSubmodules.length > 0}
            <section>
                <div class="flex items-center gap-4 px-3 py-2">
                    <div class="w-14 h-14 shrink-0 rounded-full bg-primary-100 flex items-center justify-center dm-icon-circle">
                        {#if module.icon}
                            <img src="/module_icons/{$dark ? 'dark' : 'cyan'}/{module.icon}.svg" alt="{module.title} icon" class="w-10 h-10" />
                        {:else}
                            <Icon icon="tabler:stack-2" class="w-10 h-10 text-primary" />
                        {/if}
                    </div>
                    <h2 class="text-lg md:text-xl font-bold text-slate-900 dm-text">
                        {module.title}
                        <span class="ml-2 text-xs font-normal text-gray-400 dm-text3">{module.id}</span>
                    </h2>
                </div>

                <div class="mt-1">
                    {#each visibleSubmodules as submodule}
                        <div class="flex items-center gap-2 rounded-lg pl-8 pr-3 transition-colors hover:bg-slate-50 group dm-hover">
                            <a
                                href="/admin/quiz/{submodule.id}"
                                class="flex items-center gap-3 flex-1 min-w-0 py-2.5"
                            >
                                <Icon icon="tabler:checkbox" class="h-5 w-5 text-admin shrink-0" />
                                <span class="flex-1 text-slate-700 dm-text2 truncate">
                                    {submodule.title}
                                    <span class="ml-2 text-xs text-gray-400 dm-text3">{submodule.id}</span>
                                    <span class="ml-2 text-xs text-gray-400 dm-text3">({questionCountBySubmodule[submodule.id] ?? 0} Frage{(questionCountBySubmodule[submodule.id] ?? 0) === 1 ? '' : 'n'})</span>
                                </span>
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

                    {#if !matchingSubmoduleIds}
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
                    {/if}
                </div>
            </section>
            {/if}
        {/each}
    </div>
</div>

<ConfirmDialog
    open={pendingDelete !== null}
    title="Quiz unwiderruflich löschen"
    message={deleteMessage}
    confirmLabel="Löschen"
    cancelLabel="Abbrechen"
    onConfirm={confirmDelete}
    onCancel={() => (pendingDelete = null)}
/>
