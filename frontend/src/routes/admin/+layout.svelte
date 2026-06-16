<script lang="ts">
	let { children } = $props();

	$effect(() => {
		document.documentElement.classList.add('admin-theme');
		return () => document.documentElement.classList.remove('admin-theme');
	});
</script>

<main class="font-montserrat max-w-4xl mx-auto py-10 px-4">
	{@render children()}
</main>
