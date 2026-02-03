<script lang="ts">
	import type { PageData } from './$types';
	import type { Question } from '$lib/types';
	import QuestionCard from '$lib/components/QuestionCard.svelte';
	import QuizResult from '$lib/components/QuizResult.svelte';

	let { data }: { data: PageData } = $props();

	// State
	let index = $state(0);
	let score = $state(0);
	let selected = $state<number[]>([]);
	let answerChecked = $state(false);

	// Derived state
	// We assume data.questions is populated by your load function
	let questions = $derived((data.questions as unknown as Question[]) ?? []);
	let question = $derived(questions[index]);
	let isLast = $derived(index === questions.length - 1);
	let showResult = $derived(index >= questions.length);

	function toggleOption(i: number) {
		if (answerChecked) return;

		if (question.type === 'single_choice') {
			selected = [i];
		} else {
			if (selected.includes(i)) {
				selected = selected.filter((s) => s !== i);
			} else {
				selected = [...selected, i];
			}
		}
	}

	function checkAnswer() {
		answerChecked = true;
		// Check if all correct options are selected and no incorrect ones are
		const isCorrect = question.options.every((opt, i) => opt.isCorrect === selected.includes(i));
		if (isCorrect) score++;
	}

	function nextQuestion() {
		index++;
		selected = [];
		answerChecked = false;
	}
</script>

<div class="max-w-2xl mx-auto p-6">
	{#if showResult}
		<QuizResult {score} total={questions.length} />
	{:else if question}
		<QuestionCard
			{question}
			{selected}
			{answerChecked}
			{isLast}
			onToggle={toggleOption}
			onCheck={checkAnswer}
			onNext={nextQuestion}
		/>
	{:else}
		<div class="text-center p-10">
			<p class="text-gray-500">No questions found.</p>
			<a href="/" class="text-blue-600 hover:underline mt-4 inline-block">Back to Home</a>
		</div>
	{/if}
</div>