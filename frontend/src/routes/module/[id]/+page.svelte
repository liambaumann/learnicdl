<script lang="ts">
	import type { PageData } from './$types';

	// Receive the data that +page.ts returned
	let { data }: { data: PageData } = $props();
</script>

<div class="font-montserrat max-w-4xl mx-auto py-10 px-4">
	<h1 class="text-3xl font-bold mb-6">Modul {data.module.title}: Quizze</h1>

    <p class="">{data.module.description}</p>

	<div class="grid gap-4">
		{#each data.submodules as submodule}
			<a href="/quiz/{submodule.id}" class="block p-6 bg-white border-2 border-b-4 border-gray-300 rounded-xl hover:bg-gray-50 flex">
				<div class="">
					<h2 class="text-xl font-bold">{submodule.title}</h2>
				</div>
			</a>
		{/each}
	</div>
</div>
