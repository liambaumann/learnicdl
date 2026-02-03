<script lang="ts">
	import type { Question } from '$lib/types';

	let {
		question,
		selected,
		answerChecked,
		isLast,
		onToggle,
		onCheck,
		onNext
	}: {
		question: Question;
		selected: number[];
		answerChecked: boolean;
		isLast: boolean;
		onToggle: (index: number) => void;
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
			{#each question.options as opt, i}
				<button
					onclick={() => onToggle(i)}
					class="w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-3
                    {answerChecked
						? opt.isCorrect
							? 'border-green-500 bg-green-50 text-green-900'
							: selected.includes(i)
								? 'border-red-400 bg-red-50 text-red-900'
								: 'border-gray-200'
						: selected.includes(i)
							? 'border-primary-600 bg-primary-50 text-primary-900'
							: 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'}"
					disabled={answerChecked}
				>
					{#if question.type === 'single_choice'}
						<!-- Single Choice: Round radiobutton -->
						<div
							class="w-5 h-5 rounded-full border flex items-center justify-center
                            {answerChecked
								? opt.isCorrect
									? 'bg-green-500 border-green-500'
									: selected.includes(i)
										? 'bg-red-400 border-red-400'
										: 'border-gray-300 bg-white'
								: selected.includes(i)
									? 'bg-primary-600 border-primary-600'
									: 'border-gray-300 bg-white'}"
						>
							{#if answerChecked && opt.isCorrect}
								<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
								</svg>
							{:else if answerChecked && selected.includes(i)}
								<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
								</svg>
							{:else if selected.includes(i)}
								<div class="w-2 h-2 bg-white rounded-full"></div>
							{/if}
						</div>
					{:else}
						<!-- Multiple Choice: Rounded square with checkmark -->
						<div
							class="w-5 h-5 rounded-md border flex items-center justify-center
                            {answerChecked
								? opt.isCorrect
									? 'bg-green-500 border-green-500'
									: selected.includes(i)
										? 'bg-red-400 border-red-400'
										: 'border-gray-300 bg-white'
								: selected.includes(i)
									? 'bg-primary-600 border-primary-600'
									: 'border-gray-300 bg-white'}"
						>
							{#if !answerChecked || (answerChecked && opt.isCorrect)}
								<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
								</svg>
							{:else if answerChecked && selected.includes(i)}
								<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
								</svg>
							{/if}
						</div>
					{/if}

					{opt.text}
				</button>
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