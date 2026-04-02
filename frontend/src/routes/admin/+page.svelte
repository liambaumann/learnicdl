<script lang="ts">
    import type { PageData } from './$types';
    import Icon from '@iconify/svelte';
    
    let { data }: { data: PageData } = $props();
</script>

<div class="font-montserrat max-w-4xl mx-auto py-10 px-4">
    <header class="mb-8">
        <h1 class="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
        <p class="text-gray-500">Willkommen zurück, {data.user.name}.</p>
    </header>

    <div class="border-2 rounded-xl border-gray-300 divide-y-2 divide-gray-300 overflow-hidden bg-white">
        
        <a href="/admin/modules" class="flex items-center p-5 hover:bg-gray-50 transition-colors group">
            <div class="shrink-0 p-3 bg-gray-100 rounded-lg group-hover:bg-primary/10 transition-colors">
                <Icon icon="tabler:stack-2" class="w-8 h-8 text-primary" />
            </div>
            <div class="flex-1 ml-4">
                <h2 class="text-xl font-bold text-slate-800">Module verwalten</h2>
                <p class="text-slate-600">Erstellen und Bearbeiten von ICDL Modulen.</p>
            </div>
            <Icon icon="tabler:chevron-right" class="w-6 h-6 text-gray-300" />
        </a>

        <a href="/admin/results" class="flex items-center p-5 hover:bg-gray-50 transition-colors group">
            <div class="shrink-0 p-3 bg-gray-100 rounded-lg group-hover:bg-primary/10 transition-colors">
                <Icon icon="tabler:users" class="w-8 h-8 text-primary" />
            </div>
            <div class="flex-1 ml-4">
                <h2 class="text-xl font-bold text-slate-800">Stats</h2>
                <p class="text-slate-600">Allgemeine Statistiken und Auswertungen einsehen.</p>
            </div>
            <Icon icon="tabler:chevron-right" class="w-6 h-6 text-gray-300" />
        </a>

    </div>
</div>