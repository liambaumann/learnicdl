<script lang="ts">
	import type { PageData } from './$types';
	import type { Question } from '$lib/types';
	import QuestionCard from '$lib/components/QuestionCard.svelte';
	import QuizResult from '$lib/components/QuizResult.svelte';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	// --- State ---
	let currentQuestions = $state<Question[]>([]);
	let failedQuestions = $state<Question[]>([]);
	let index = $state(0);
	let firstAttemptCorrect = $state(0);
	let isRetryRound = $state(false);
	let selectedAns = $state<string[]>([]);
	let answerChecked = $state(false);

	// Initialize questions once on mount to avoid reactive-effect loops
	onMount(() => {
		if ((currentQuestions.length === 0 || currentQuestions == null) && data?.questions) {
			currentQuestions = (data.questions as unknown as Question[]) || [];
		}
	});

	// --- Derived state ---
	let question = $derived(currentQuestions[index]);

	// Ensure we don't show the result screen if there are 0 questions
	let showResult = $derived(index >= currentQuestions.length && currentQuestions.length > 0 && failedQuestions.length === 0);

	// --- Functions ---
	// We now expect the child component to directly pass the string ID of the option
	function toggleOption(optionId: string) {
		if (answerChecked) return;

		// Make sure this string matches EXACTLY what you set in PocketBase (e.g., 'single' or 'single_choice')
		if (question.type === 'single_choice') {
			selectedAns = [optionId];
		} else {
			// Toggle logic for multiple choice
			if (selectedAns.includes(optionId)) {
				selectedAns = selectedAns.filter((id) => id !== optionId);
			} else {
				selectedAns = [...selectedAns, optionId];
			}
		}
	}

	// Parent-owned correctness state and checker
	let isCorrect = $state<boolean | null>(null);

	function checkAnswer() {
		if (answerChecked) return;

		const correctAns = question.answers as string[];
		answerChecked = true;

		isCorrect =
			selectedAns.length === correctAns.length &&
			selectedAns.every((id) => correctAns.includes(id));

		if (isCorrect) {
			if (!isRetryRound) firstAttemptCorrect++;
		} else {
			// Add to failed questions if not already in there for this round
			if (!failedQuestions.some((q) => q.id === question.id)) {
				failedQuestions.push(question);
			}
		}
	}

	function nextQuestion() {
		if (index < currentQuestions.length - 1) {
			index++;
		} else if (failedQuestions.length > 0) {
			// Start retry round
			currentQuestions = [...failedQuestions];
			failedQuestions = [];
			index = 0;
			isRetryRound = true;
		} else {
			// End of quiz
			index++;
		}

		selectedAns = [];
		answerChecked = false;
		isCorrect = null;
	}
</script>

<div class="font-montserrat max-w-4xl mx-auto h-full">
	{#if showResult}
		<QuizResult score={firstAttemptCorrect} total={data.questions.length} moduleHref="/module/{data.submodule.module}" moduleTitle={data.module.title} />
	{:else if question}
		<QuestionCard
			{question}
			selected={selectedAns}
			{answerChecked}
			{isCorrect}
			score={firstAttemptCorrect}
			totalQuestions={data.questions.length}
			quizTitle={data.submodule.title}
			exitHref="/module/{data.submodule.module}"
			onToggle={toggleOption}
			onCheck={checkAnswer}
			onNext={nextQuestion}
		/>
	{:else}
		<div class="text-center p-10">
			<h1 class="text-gray-500 text-xl">Dieses Quiz hat noch keine Fragen.</h1>
			<p>Vermutlich wurden sie noch nicht eingebettet. Wir bitten noch um etwas Geduld.</p>
			<a href="/" class="text-blue-600 hover:underline mt-4 inline-block">Zurück</a>
		</div>
	{/if}
</div>
