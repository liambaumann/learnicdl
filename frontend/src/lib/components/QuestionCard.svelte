<script lang="ts">
	import type { Question } from '$lib/types';
	import OptionRadio from './question/OptionRadio.svelte';
	import OptionCheckbox from './question/OptionCheckbox.svelte';

	let {
		question,
		selected,
		answerChecked,
		isLast,
		isCorrect,
		onToggle,
		onCheck,
		onNext
	}: {
		question: Question;
		selected: string[];
		answerChecked: boolean;
		isLast: boolean;
		isCorrect?: boolean | null;
		onToggle: (id: string) => void;
		onCheck: () => void;
		onNext: () => void;
	} = $props();
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
	<div class="p-8">
		<span class="text-xs font-bold tracking-wider text-primary-500 uppercase mb-2 block">
			{question.type === 'single_choice' ? 'Single Choice' : 'Multiple Choice'}
		</span>
		<h3 class="text-xl font-medium text-gray-900 mb-6">
			{question.text}
		</h3>

		<div class="space-y-3">
			{#each question.options as opt}
				{#if question.type === 'single_choice'}
					<OptionRadio
						{opt}
						{selected}
						{answerChecked}
						questionAnswers={question.answers}
						onToggle={onToggle}
					/>
				{:else}
					<OptionCheckbox
						{opt}
						{selected}
						{answerChecked}
						questionAnswers={question.answers}
						onToggle={onToggle}
					/>
				{/if}
			{/each}
		</div>
	</div>

	<div class="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end">
		<button
			onclick={answerChecked ? onNext : onCheck}
			disabled={!answerChecked && selected.length === 0}
			class="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg shadow hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
		>
			{answerChecked ? (isLast ? 'Finish Quiz' : 'Next Question →') : 'Check Answer'}
		</button>
	</div>
</div>