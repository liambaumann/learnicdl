<script lang="ts">
	import Icon from '@iconify/svelte';

	let { score, total, moduleHref, moduleTitle }: {
		score: number;
		total: number;
		moduleHref: string;
		moduleTitle: string;
	} = $props();
</script>

<div class="fixed inset-0 flex items-center justify-center bg-white dm-result-bg">
	<div class="text-center p-10">
		<h2 class="text-3xl font-bold text-gray-800 dm-text mb-8">Quiz abgeschlossen!</h2>

		<p class="text-xs font-semibold uppercase tracking-widest text-slate-400 dm-text3 mb-2">Dein Ergebnis</p>
		<div class="mb-2">
			<span class="text-5xl font-black text-primary-600">{score}</span>
			<span class="text-2xl text-primary-300 font-bold">/{total}</span>
		</div>
		<p class="text-sm text-slate-500 dm-text2 mb-10">
			Antworten waren beim ersten Versuch korrekt.<br />
			Das entspricht <span class="font-semibold text-slate-700 dm-text">{Math.floor(score / total * 100)}%</span>.
		</p>

		<div class="flex flex-col sm:flex-row items-center justify-center gap-3">
			<a
				href={moduleHref}
				class="inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg text-white bg-primary border-2 border-b-4 border-primary-800 hover:bg-primary-700 transition-colors"
			>
				{moduleTitle}
			</a>
			<a
				href="/"
				class="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold rounded-lg text-gray-700 bg-white border-2 border-b-4 border-gray-300 hover:bg-gray-50 transition-colors dm-result-btn"
			>
				<Icon icon="tabler:home" class="w-5 h-5" />
				Modulübersicht
			</a>
		</div>
	</div>
</div>
