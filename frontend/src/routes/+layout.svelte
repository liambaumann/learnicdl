<script lang="ts">
	import Icon from '@iconify/svelte';
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import { page } from '$app/stores';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	import hatwhite from '$lib/assets/hat-white.svg';

	let { children } = $props();
	let isAdmin = $derived($page.url.pathname.startsWith('/admin'));
	let isQuiz = $derived($page.url.pathname.startsWith('/quiz/'));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex flex-col h-dvh bg-white dm-bg">
	{#if !isQuiz}
	<nav class="shrink-0 w-full sticky top-2 z-50 mx-auto max-w-4xl px-2 mt-2">
		<div class="flex items-center justify-between border-2 border-b-4 border-primary-800 rounded-xl bg-primary backdrop-blur-md shadow-sm px-4 py-3 dm-nav">
			<a href="/" class="text-lg font-bold font-montserrat tracking-tight text-white flex items-center dm-nav-text">
				<img src={hatwhite} alt="LearnICDL Logo" class="inline-block w-10 h-10 mr-2" />
				<span class="opacity-60">Learn</span>
				<span>ICDL</span>
				{#if isAdmin}<span class="ml-1 opacity-60 font-light">Admin</span>{/if}
			</a>

			<div class="flex items-center gap-2">
				<ThemeToggle />
				<a
					href="/user"
					aria-label="Benutzerverwaltung"
					class="inline-flex items-center justify-center w-10 h-10 rounded-lg border-2 border-b-4 border-primary-800 bg-primary text-white hover:bg-primary-700 hover:text-gray-300 transition-all dm-nav-btn"
				>
					<Icon icon="tabler:user-circle" class="w-6 h-6" />
				</a>
			</div>
		</div>
	</nav>
	{/if}

	<div class="flex-1 min-h-0 overflow-y-auto">
		{@render children()}
	</div>
</div>
