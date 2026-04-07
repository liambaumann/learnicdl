<script lang="ts">
	import Icon from '@iconify/svelte';
	import favicon from '$lib/assets/favicon.svg';
	import logo from '$lib/assets/logo.svg';
	import '../app.css';

	import hatwhite from '$lib/assets/hat-white.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="sticky top-2 z-50 mx-auto max-w-4xl px-2 mt-2">
	<div class="flex items-center justify-between border-2 border-b-4 border-primary-800 rounded-xl bg-primary backdrop-blur-md shadow-sm px-4 py-3">
		<a href="/" class="text-lg font-bold font-montserrat tracking-tight text-white flex items-center">
			<img src={hatwhite} alt="LearnICDL Logo" class="inline-block w-10 h-10 mr-2" />
			<span class="opacity-60">Learn</span>
			<span>ICDL</span>
		</a>
		<!--a href="/" class="text-lg font-bold font-montserrat tracking-tight text-white flex items-center">
			<img src={logo} alt="LearnICDL Logo" class="inline-block w-16 h-16 mr-2 border-2 border-primary-800 border-b-4 rounded-lg" />
			
		</a-->

		<a
			href="/user"
			aria-label="Benutzerverwaltung"
			class="inline-flex items-center justify-center w-10 h-10 rounded-lg border-2 border-b-4 border-primary-800 bg-primary text-white hover:bg-primary-700 hover:text-gray-300 transition-all"
		>
			<Icon icon="tabler:user-circle" class="w-6 h-6" />
		</a>
	</div>
</nav>

{@render children()}
