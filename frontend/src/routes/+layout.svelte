<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
  	import "../app.css";

	import hatblue from '$lib/assets/hat-blue.svg';
	import hatwhite from '$lib/assets/hat-white.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="sticky top-2 z-50 mx-auto max-w-4xl px-4 mt-2">
	<div class="flex items-center justify-center border-2 border-primary-300 rounded-xl bg-primary backdrop-blur-md shadow-sm border px-4 py-3">
		<a href="/" class="text-lg font-bold font-montserrat tracking-tight text-white">
			<img src={hatwhite} alt="LearnICDL Logo" class="inline-block w-10 h-10 mr-2">
			LearnICDL
		</a>
	</div>
</nav>

{@render children()}
