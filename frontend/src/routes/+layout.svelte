<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
  	import "../app.css";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="sticky top-2 z-50 mx-auto max-w-4xl px-4 mt-2">
	<div class="flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-md shadow-sm border border-gray-200 px-4 py-3">
		<a href="/" class="text-lg font-bold font-montserrat tracking-tight text-primary-600">
			LearnICDL
		</a>
	</div>
</nav>

{@render children()}
