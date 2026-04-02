<script lang="ts">
	import type { PageData } from './$types';
	import Icon from '@iconify/svelte';

	// Receive the data that +page.ts returned
	let { data }: { data: PageData } = $props();
</script>

<div class="font-montserrat max-w-4xl mx-auto py-10 px-4">
	<h1 class="text-3xl font-bold mb-6">Modul {data.module.title}</h1>

    <p class="mb-4">{data.module.description}</p>

	<h2 class="text-2xl font-bold mb-4">Verfügbare Quizze</h2>

	<div class="border-2 rounded-xl border-gray-300 divide-y-2 divide-gray-300 overflow-hidden bg-white">
		{#each data.submodules as submodule}
			<a 
				href="/quiz/{submodule.id}" 
				class="group flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
			>
				<div class="flex flex-col">
					<h2 class="text-lg font-bold text-slate-800 group-hover:text-primary-600 transition-colors">
						{submodule.title}
					</h2>
					<span class="text-xs text-slate-400 font-medium uppercase tracking-wider">
						Quiz
					</span>
				</div>

				<Icon icon="tabler:chevron-right" class="w-6 h-6 text-gray-300 group-hover:text-primary-500 transform transition-none"/>
			</a>
		{/each}
	</div>
</div>
