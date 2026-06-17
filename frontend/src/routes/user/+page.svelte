<script lang="ts">
	import Icon from '@iconify/svelte';

	let { data } = $props();
</script>

<div class="font-montserrat max-w-4xl mx-auto py-10 px-4">
	<header class="mb-8">
		<h1 class="text-2xl md:text-3xl font-bold dm-text">Benutzerverwaltung</h1>
		<p class="text-gray-500 dm-text2">Hier können Sie Ihre persönlichen Einstellungen verwalten.</p>
	</header>

	<div class="border-2 rounded-xl border-gray-300 overflow-hidden bg-white dm-card p-6">
		<div class="mb-6 dm-text">
			<strong>Name:</strong> {data.user?.name || data.user?.username} <br />
			<strong>Email:</strong> {data.user?.email}
		</div>
		<form method="POST" action="?/logout">
			<button
				type="submit"
				class="bg-primary text-white px-4 py-3 rounded-lg border-primary-800 border-2 border-b-4 transition-all duration-200 inline-flex items-center gap-2 hover:bg-primary-700"
			>
				<Icon icon="tabler:logout-2" class="w-5 h-5" />
				Logout
			</button>
		</form>
	</div>
</div>
