<script lang="ts">
	let { score, total }: { score: number; total: number } = $props();
</script>

<div class="text-center bg-white p-10 rounded-2xl shadow-sm border border-gray-200">
	<div class="text-5xl mb-4">🎉</div>
	<h2 class="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
	<p class="text-gray-600 mb-6">You scored</p>

	<div class="inline-block bg-primary-50 border border-primary-100 rounded-xl px-8 py-4 mb-8">
		<span class="text-4xl font-black text-primary-600">{score}</span>
		<span class="text-xl text-primary-400">/ {total}</span>
	</div>

	<div>
		<a href="/" class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
			Back to Quizzes
		</a>
	</div>
</div>