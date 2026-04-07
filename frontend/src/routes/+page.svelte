<script lang="ts">
	import type { PageData } from './$types';
	import Icon from '@iconify/svelte';

	// Receive the data that +page.ts returned
	let { data }: { data: PageData } = $props();
</script>

<div class="font-montserrat max-w-4xl mx-auto py-10 px-4">
	<h1 class="text-2xl md:text-3xl font-bold mb-6">Verfügbare Module</h1>

<div class="border-2 rounded-xl border-gray-300 divide-y-2 divide-gray-300 overflow-hidden bg-white">
    {#each data.modules as module}
        <a
            href="/module/{module.id}"
            class="flex items-center p-3 md:p-4 md:gap-4 hover:bg-gray-50 transition-colors"
        >
            <div class="shrink-0">
                <img
                    src="/module_icons/{module.icon}.svg"
                    alt="{module.name} icon"
                    class="w-12 h-12 md:w-16 md:h-16 mr-3 md:mr-1"
                />
            </div>
            <div class="flex-1">
                <h2 class="text-xl font-bold text-slate-800">{module.title}</h2>
                <!--p class="text-slate-600 line-clamp-2 md:line-clamp-3">{module.description}</p-->

                <span class="text-xs text-slate-400 font-medium uppercase tracking-wider">
                    Modul
                </span>
            </div>
            
			<Icon class="w-6 h-6 text-gray-300 group-hover:text-primary-500 transform transition-none" icon="tabler:chevron-right"/>
        </a>
    {/each}
</div>
</div>
