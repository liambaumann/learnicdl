<script lang="ts">
	import type { PageData } from './$types';

	// Receive the data that +page.ts returned
	let { data }: { data: PageData } = $props();
</script>

<div class="font-montserrat max-w-4xl mx-auto py-10 px-4">
	<h1 class="text-2xl md:text-3xl font-bold mb-6">Verfügbare Module</h1>

	<div class="grid gap-4">
		{#each data.modules as module}
			<a
				href="/module/{module.id}"
				class="flex items-center p-3 md:p-4 md:gap-1 bg-white border-2 border-b-4 border-gray-300 rounded-xl hover:bg-gray-50"
			>
				<div class="shrink-0 p-3">
					<img
						src="/module_icons/{module.icon}.svg"
						alt="{module.name} icon"
						class="w-12 h-12 md:w-16 md:h-16"
					/>
				</div>
				<div class="">
					<h2 class="text-xl font-bold">{module.title}</h2>
					<p class="line-clamp-2 md:line-clamp-3">{module.description}</p>
				</div>
			</a>
		{/each}
	</div>
</div>
