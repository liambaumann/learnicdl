<script lang="ts">
    import Icon from '@iconify/svelte';
    import { dark } from '$lib/theme';
    export let modules: any[] = [];
    export let submodulesByModule: Record<string, any[]> = {};
    export let user: any;
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
                        <a
                            href="/admin/quiz/{submodule.id}"
                            class="flex items-center gap-3 rounded-lg px-3 py-2.5 pl-8 transition-colors hover:bg-slate-50 group dm-hover"
                        >
                            <Icon icon="tabler:checkbox" class="h-5 w-5 text-admin shrink-0" />
                            <span class="flex-1 text-slate-700 dm-text2">{submodule.title}</span>
                            <Icon icon="tabler:chevron-right" class="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors dm-icon" />
                        </a>
                    {:else}
                        <p class="px-3 py-2 pl-8 text-sm text-gray-400 dm-text3">Keine Quizze in diesem Modul.</p>
                    {/each}
                </div>
            </section>
        {/each}
    </div>
</div>
