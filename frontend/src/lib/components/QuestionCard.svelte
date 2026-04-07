<script lang="ts">
	import type { Question } from '$lib/types';
	//import OptionRadio from './question/OptionRadio.svelte';
	//import OptionCheckbox from './question/OptionCheckbox.svelte';
	import Option from './question/Option.svelte';

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

	const hasCorrectAnswers = () => question.answers.length > 0;
</script>

<div class="bg-white rounded-xl border-2 border-gray-300 border-b-4 overflow-hidden">
	<div class="p-5 sm:p-8">
		<span class="text-xs font-bold tracking-wider text-primary-500 uppercase mb-2 block">
			{question.type === 'single_choice' ? 'Single Choice' : 'Multiple Choice'}
		</span>
		<h3 class="text-xl font-medium text-gray-900 mb-6">
			{question.text}
		</h3>
		{#if question.image}
			<img
				src={question.image}
				alt="Frage Bild"
				class="mx-auto rounded-lg mb-6 max-h-64 object-cover"
			/>
		{/if}

		<div class="space-y-3">
			{#each question.options as opt}
				<Option
					{opt}
					{selected}
					{answerChecked}
					questionAnswers={question.answers}
					{onToggle}
					questionType={question.type}
				/>
			{/each}
		</div>
	</div>

	<div class="px-5 sm:px-8 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-end
	{answerChecked
		? isCorrect
			? 'bg-green-100 border-green-300'
			: 'bg-red-100 border-red-300'
		: 'bg-gray-100 border-gray-200'}">

		{#if answerChecked}
			{#if isCorrect}
				<span class="text-green-700 font-medium sm:mr-auto">Richtig!</span>
			{:else}
				<span class="text-red-700 font-medium sm:mr-auto">Nicht Ganz.</span>
			{/if}
		{/if}
		<button
			onclick={answerChecked ? onNext : onCheck}
			disabled={!answerChecked && selected.length === 0 && hasCorrectAnswers()}
			class="w-full sm:w-auto px-6 py-3 sm:py-2.5 text-white font-medium rounded-lg shadow disabled:opacity-30 disabled:cursor-not-allowed transition-all
			{answerChecked
				? isCorrect
					? 'bg-green-500 hover:bg-green-600'
					: 'bg-red-500 hover:bg-red-600'
				: 'bg-primary hover:bg-primary-700'}"
		>
			{answerChecked ? (isLast ? 'Quiz abschließen' : 'Nächste Frage →') : 'Frage überprüfen'}
		</button>
	</div>
</div>
