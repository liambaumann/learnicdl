<script lang="ts">
	import type { PageData } from './$types';

	// Receive the data that +page.ts returned
	let { data }: { data: PageData } = $props();
</script>

<div class="font-montserrat max-w-4xl mx-auto py-10 px-4">
	<h1 class="text-3xl font-bold mb-6">Verfügbare Quizze</h1>

	<div class="grid gap-4">
		{#each data.modules as module}
			<a href="/quiz/{module.id}" class="block p-6 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 flex">
				<div class="p-3 bg-sky-50 rounded-xl">
					<img src="/module_icons/{module.icon}.svg" alt="{module.name} icon" class="w-16 h-16" />
				</div>
				<div class="max-w-md">
					<h2 class="text-xl font-bold">{module.title}</h2>
					<p>{module.description}</p>
				</div>
			</a>
		{/each}
	</div>
</div>
