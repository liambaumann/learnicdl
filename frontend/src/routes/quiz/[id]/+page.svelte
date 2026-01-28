<script lang="ts">
    import type { PageData } from './$types';

    // --- TYPES ---
    // We define what our data looks like so TypeScript is happy
    interface Question {
        text: string;
        type: 'single_choice' | 'multiple_choice'; // Must match your PocketBase values exactly
        options: string[];
        answers: number[];
    }

    // --- PROPS ---
    let { data }: { data: PageData } = $props();

    // --- STATE (Runes) ---
    let index = $state(0);
    let selected = $state<number[]>([]); // User's selected answers for current Q
    let score = $state(0);
    let showResult = $state(false);
    let answerChecked = $state(false); // Track if user has checked the answer

    // --- DERIVED ---
    // Cast data.questions to our Interface to fix type errors
    let questions = $derived(data.questions as unknown as Question[]);
    let question = $derived(questions[index]);
    let isLast = $derived(index === questions.length - 1);

    // --- ACTIONS ---
    function toggleOption(optIndex: number) {
        if (answerChecked) return; // Disable selection after answer is checked
        
        if (question.type === 'single_choice') {
            // Single Choice: Just select this one
            selected = [optIndex];
        } else {
            // Multiple Choice: Toggle it on/off
            if (selected.includes(optIndex)) {
                selected = selected.filter(i => i !== optIndex);
            } else {
                selected = [...selected, optIndex];
            }
        }
    }

    function checkAnswer() {
        answerChecked = true;
        
        // Simple scoring logic: Arrays must match exactly
        const userAns = [...selected].sort().toString();
        const correctAns = [...question.answers].sort().toString();

        if (userAns === correctAns) score++;
    }

    function nextQuestion() {
        if (isLast) {
            showResult = true;
        } else {
            index++;
            selected = [];
            answerChecked = false;
        }
    }
</script>

<div class="max-w-2xl mx-auto py-10 px-4">
    
    <div class="mb-8 flex justify-between items-end border-b pb-4">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">{data.quiz.title}</h1>
            <p class="text-sm text-gray-500">{data.quiz.description}</p>
        </div>
        {#if !showResult}
            <span class="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                {index + 1} / {questions.length}
            </span>
        {/if}
    </div>

    {#if showResult}
        
        <div class="text-center bg-white p-10 rounded-2xl shadow-sm border border-gray-200">
            <div class="text-5xl mb-4">🎉</div>
            <h2 class="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
            <p class="text-gray-600 mb-6">You scored</p>
            
            <div class="inline-block bg-indigo-50 border border-indigo-100 rounded-xl px-8 py-4 mb-8">
                <span class="text-4xl font-black text-indigo-600">{score}</span>
                <span class="text-xl text-indigo-400">/ {questions.length}</span>
            </div>

            <div>
                <a href="/" class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    Back to Quizzes
                </a>
            </div>
        </div>

    {:else if question}
        
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-8">
                <span class="text-xs font-bold tracking-wider text-indigo-500 uppercase mb-2 block">
                    {question.type === 'single_choice' ? 'Single Choice' : 'Multiple Choice'}
                </span>
                <h3 class="text-xl font-medium text-gray-900 mb-6">
                    {question.text}
                </h3>

                <div class="space-y-3">
                    {#each question.options as opt, i}
                        <button 
                            onclick={() => toggleOption(i)}
                            class="w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-3
                            {answerChecked 
                                ? question.answers.includes(i)
                                    ? 'border-green-500 bg-green-50 text-green-900' 
                                    : selected.includes(i)
                                        ? 'border-red-400 bg-red-50 text-red-900'
                                        : 'border-gray-200'
                                : selected.includes(i) 
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}"
                            disabled={answerChecked}
                        >
                            {#if question.type === 'single_choice'}
                                <!-- Single Choice: Round radiobutton -->
                                <div class="w-5 h-5 rounded-full border flex items-center justify-center
                                    {answerChecked 
                                        ? question.answers.includes(i)
                                            ? 'bg-green-500 border-green-500'
                                            : selected.includes(i)
                                                ? 'bg-red-400 border-red-400'
                                                : 'border-gray-300 bg-white'
                                        : selected.includes(i) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}">
                                    {#if answerChecked && question.answers.includes(i)}
                                        <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                        </svg>
                                    {:else if answerChecked && selected.includes(i)}
                                        <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                        </svg>
                                    {:else if selected.includes(i)}
                                        <div class="w-2 h-2 bg-white rounded-full"></div>
                                    {/if}
                                </div>
                            {:else}
                                <!-- Multiple Choice: Rounded square with checkmark -->
                                <div class="w-5 h-5 rounded-md border flex items-center justify-center
                                    {answerChecked 
                                        ? question.answers.includes(i)
                                            ? 'bg-green-500 border-green-500'
                                            : selected.includes(i)
                                                ? 'bg-red-400 border-red-400'
                                                : 'border-gray-300 bg-white'
                                        : selected.includes(i) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}">
                                    {#if answerChecked && question.answers.includes(i)}
                                        <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                        </svg>
                                    {:else if answerChecked && selected.includes(i)}
                                        <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                        </svg>
                                    {:else if selected.includes(i)}
                                        <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                        </svg>
                                    {/if}
                                </div>
                            {/if}
                            
                            {opt}
                        </button>
                    {/each}
                </div>
            </div>

            <div class="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end">
                <button 
                    onclick={answerChecked ? nextQuestion : checkAnswer}
                    disabled={!answerChecked && selected.length === 0}
                    class="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg shadow hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    {answerChecked 
                        ? (isLast ? 'Finish Quiz' : 'Next Question →') 
                        : 'Check Answer'}
                </button>
            </div>
        </div>

    {:else}
        <p class="text-center text-gray-500 mt-10">No questions found for this quiz.</p>
    {/if}

</div>