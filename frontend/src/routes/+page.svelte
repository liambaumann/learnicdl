<script lang="ts">
	import type { PageData } from './$types';
	import Icon from '@iconify/svelte';

	let { data }: { data: PageData } = $props();
</script>

<div class="font-montserrat max-w-3xl mx-auto py-10 px-4">
	<p class="text-xs font-semibold uppercase tracking-widest text-slate-400 dm-text3 mb-3">
		Verfügbare Module &middot; {data.modules.length}
	</p>

	<div class="border-2 border-b-4 border-gray-300 rounded-xl divide-y divide-gray-200 overflow-hidden bg-white dm-card dm-divide">
		{#each data.modules as module}
			<a
				href="/module/{module.id}"
				class="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group dm-hover"
			>
				<img
					src="/module_icons/{module.icon}.svg"
					alt="{module.title} icon"
					class="w-10 h-10 shrink-0"
				/>
				<span class="flex-1 text-base font-semibold text-slate-800 dm-text">{module.title}</span>
				<Icon
					class="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors dm-icon"
					icon="tabler:chevron-right"
				/>
			</a>
		{/each}
	</div>
</div>
