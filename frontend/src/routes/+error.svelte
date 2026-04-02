<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
</script>

<div class="font-montserrat flex flex-col items-center justify-center gap-8 mt-16">
	{#if page.status === 404}
		<div class="">
			<h1 class="text-center text-primary text-5xl md:text-[8rem] font-black">404 :(</h1>
			<h2 class="text-center text-primary text-xl md:text-3xl mt-4 font-bold">
				Diese Seite existiert nicht
			</h2>
		</div>
	{:else}
		<h1 class="text-center text-primary text-9xl text-[10rem]">Ups! Da ist etwas schiefgelaufen</h1>
	{/if}
	<button class="bg-primary text-white p-4 rounded-lg border-primary-800 border-2 border-b-4 transition-all duration-200 flex items-center gap-3" on:click={() => goto('/')}>Zurück zur Startseite</button>
</div>

<style>
	/* This forces this specific component to keep its Tailwind classes
       even if the rest of the app's CSS is unmounted by Vite */
	@tailwind utilities;
</style>
