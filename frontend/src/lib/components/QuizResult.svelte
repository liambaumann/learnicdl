<script lang="ts">
	let { score, total }: { score: number; total: number } = $props();
</script>

<div class="fixed inset-0 flex items-center justify-center">
<div class="text-center p-10">
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
			class="inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg text-white bg-primary border-2 border-b-4 border-primary-800 hover:bg-primary-700 transition-colors"
		>
			Zurück zu den Quizzen
		</a>
	</div>
</div>
</div>
