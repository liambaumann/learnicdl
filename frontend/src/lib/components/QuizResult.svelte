<script lang="ts">
	let { score, total }: { score: number; total: number } = $props();
</script>

<div class="text-center bg-white p-10 border-2 border-b-4 border-gray-300 rounded-xl">
	<h2 class="text-3xl font-bold text-gray-800 mb-2">Quiz abgeschlossen!</h2>
	<p class="text-gray-600 mb-6">Dein Ergebnis</p>

	<div
		class="inline-block bg-primary-50 border-2 border-b-4 border-primary rounded-xl px-8 py-4 mb-8"
	>
		<span class="text-4xl font-black text-primary-600">{score}</span>
		<span class="text-xl text-primary-400">/ {total}</span>
	</div>

	<div>
		<a
			href="/"
			class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
		>
			Zurück zu den Quizzen
		</a>
	</div>
</div>
