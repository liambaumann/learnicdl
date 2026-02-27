<script lang="ts">
    import type { PageData } from './$types';
    import type { Question } from '$lib/types';
    import QuestionCard from '$lib/components/QuestionCard.svelte';
    import QuizResult from '$lib/components/QuizResult.svelte';

    let { data }: { data: PageData } = $props();

    // --- State ---
    let index = $state(0);
    let score = $state(0);
    let selectedAns = $state<string[]>([]);
    let answerChecked = $state(false);

    // --- Derived state ---
    // Cleaned up the typing cast here
	let questions = $derived((data.questions as unknown as Question[]) || []);
    let question = $derived(questions[index]);
    let isLast = $derived(index === questions.length - 1);
    
    // Ensure we don't show the result screen if there are 0 questions
    let showResult = $derived(index >= questions.length && questions.length > 0);

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

        if (isCorrect) score++;
    }

    function nextQuestion() {
        index++;
        selectedAns = [];
        answerChecked = false;
        isCorrect = null;
    }
</script>

<div class="max-w-2xl mx-auto p-6">
    {#if showResult}
        <QuizResult {score} total={questions.length} />
    {:else if question}
        <QuestionCard
            question={question}
            selected={selectedAns}
            {answerChecked}
            {isLast}
            isCorrect={isCorrect}
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