<script lang="ts">
	import type { PageData } from './$types';
	import Icon from '@iconify/svelte';
	import { dark } from '$lib/theme';

	let { data }: { data: PageData } = $props();
</script>

<div class="font-montserrat max-w-3xl mx-auto py-10 px-4">
	<div class="flex items-center gap-3 mb-3">
		<img
			src="/module_icons/{$dark ? 'dark' : 'cyan'}/{data.module.icon}.svg"
			alt="{data.module.title} icon"
			class="w-10 h-10 shrink-0"
		/>
		<h1 class="text-3xl font-bold text-slate-900 dm-text">Modul {data.module.title}</h1>
	</div>

	<p class="text-slate-500 dm-text2 leading-relaxed mb-10">{data.module.description}</p>

	<p class="text-xs font-semibold uppercase tracking-widest text-slate-400 dm-text3 mb-3">
		Verfügbare Quizze &middot; {data.submodules.length}
	</p>

	<div class="border-2 border-b-4 border-gray-300 rounded-xl divide-y-2 divide-gray-200 overflow-hidden bg-white dm-card dm-divide">
		{#each data.submodules as submodule}
			<a
				href="/quiz/{submodule.id}"
				class="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group dm-hover"
			>
				<Icon
					icon="tabler:square-rounded"
					class="w-5 h-5 shrink-0 text-slate-300 dm-icon"
				/>
				<span class="flex-1 text-base font-semibold text-slate-800 dm-text">
					{submodule.title}
				</span>
				<Icon
					icon="tabler:chevron-right"
					class="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors dm-icon"
				/>
			</a>
		{/each}
	</div>
</div>
