<script lang="ts">
    import Icon from '@iconify/svelte';
    export let modules: any[] = [];
    export let submodulesByModule: Record<string, any[]> = {};
    export let user: any;
</script>

<div>
    <header class="mb-8 text-left">
        <h1 class="text-2xl md:text-4xl font-bold">Modul- und Quizübersicht</h1>
        <p class="text-gray-500 mt-2">Willkommen zurück, {user?.name}.</p>

        <div class="mt-6 flex items-center justify-start gap-3 text-sm text-gray-600">
            <div class="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <div class="font-semibold text-slate-900">{modules.length}</div>
                <div>Module</div>
            </div>
            <div class="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <div class="font-semibold text-slate-900">{Object.values(submodulesByModule).reduce((c,arr)=>c+arr.length,0)}</div>
                <div>Quizze</div>
            </div>
        </div>
    </header>

    <div class="space-y-6">
        {#each modules as module}
            <section class="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-sm">
                <div class="flex flex-col gap-4 border-b-2 border-gray-200 p-5 md:flex-row md:items-center md:justify-between">
                    <div class="flex items-center gap-4">
                        <div class="shrink-0 rounded-xl bg-admin-50 p-3">
                            {#if module.icon}
                                <img src="/module_icons/{module.icon}.svg" alt="{module.title} icon" class="h-12 w-12" />
                            {:else}
                                <Icon icon="tabler:stack-2" class="h-12 w-12 text-admin" />
                            {/if}
                        </div>
                        <div>
                            <h2 class="text-xl md:text-2xl font-bold text-slate-900">{module.title}</h2>
                            <p class="text-sm uppercase tracking-wider text-gray-400">Modul</p>
                        </div>
                    </div>
                    <a href="/module/{module.id}" class="inline-flex items-center gap-2 self-start rounded-xl border-2 border-admin-800 bg-admin px-4 py-2 text-white transition-colors hover:bg-admin-700">
                        <Icon icon="tabler:eye" class="h-5 w-5" />
                        Öffnen
                    </a>
                </div>

                {#if module.description}
                    <div class="border-b border-gray-200 px-5 py-4 text-gray-600">{module.description}</div>
                {/if}

                <div class="divide-y divide-gray-200">
                    {#each submodulesByModule[module.id] ?? [] as submodule}
                        <a href="/admin/quiz/{submodule.id}" class="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50">
                            <div class="shrink-0 rounded-lg bg-gray-100 p-2 text-admin">
                                <Icon icon="tabler:checkbox" class="h-6 w-6" />
                            </div>
                            <div class="min-w-0 flex-1">
                                <h3 class="font-semibold text-slate-900">{submodule.title}</h3>
                                <p class="text-xs uppercase tracking-wider text-gray-400">Quiz</p>
                            </div>
                            <Icon icon="tabler:chevron-right" class="h-5 w-5 text-gray-300" />
                        </a>
                    {:else}
                        <div class="px-5 py-6 text-gray-500">Keine Quizze in diesem Modul.</div>
                    {/each}
                </div>
            </section>
        {/each}
    </div>
</div>
