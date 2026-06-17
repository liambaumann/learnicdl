<script lang="ts">
	import type { Question } from '$lib/types';
	import Option from './question/Option.svelte';
	import Icon from '@iconify/svelte';

	let {
		question,
		selected,
		answerChecked,
		isCorrect,
		score,
		totalQuestions,
		quizTitle,
		exitHref,
		onToggle,
		onCheck,
		onNext,
		onHint = () => {},
		onExplain = () => {},
		onReport = () => {}
	}: {
		question: Question;
		selected: string[];
		answerChecked: boolean;
		isCorrect?: boolean | null;
		score: number;
		totalQuestions: number;
		quizTitle: string;
		exitHref: string;
		onToggle: (id: string) => void;
		onCheck: () => void;
		onNext: () => void;
		onHint?: () => void;
		onExplain?: () => void;
		onReport?: () => void;
	} = $props();

	const hasCorrectAnswers = () => question.answers.length > 0;
	let lightboxOpen = $state(false);
</script>

<div class="flex flex-col h-full overflow-hidden">
	<!-- Zone 1: Quiz header + progress -->
	<div class="shrink-0 px-5 sm:px-8 pt-4 pb-5">
		<div class="flex items-center gap-2 mb-2.5">
			<a
				href={exitHref}
				class="shrink-0 text-gray-400 hover:text-gray-600 transition-colors dm-icon-close"
				aria-label="Quiz verlassen"
			>
				<Icon icon="tabler:x" class="w-5 h-5" />
			</a>
			<span class="flex-1 text-lg font-bold text-gray-800 truncate dm-text">{quizTitle}</span>
			<span class="shrink-0 text-sm text-gray-400 tabular-nums dm-text2">{Math.round(score / totalQuestions * 100)}%</span>
		</div>
		<div class="h-1.5 bg-gray-200 rounded-full overflow-hidden dm-progress">
			<div
				class="h-full bg-primary rounded-full transition-all duration-500 ease-out"
				style="width: {(score / totalQuestions) * 100}%"
			></div>
		</div>
	</div>

	<!-- Zone 2: Scrollable content -->
	<div class="flex-1 min-h-0 overflow-y-auto pt-3 pb-6">
		<div class="max-w-2xl mx-auto px-5 sm:px-6">
			<span class="text-xs font-bold tracking-wider text-primary-500 uppercase mb-2 block">
				{question.type === 'single_choice' ? 'Single Choice' : 'Multiple Choice'}
			</span>

			<div class="flex justify-between items-start mb-5">
				<h3 class="text-base sm:text-lg font-medium text-gray-900 flex-1 mr-3 dm-text">
					{question.text}
				</h3>
				<button
					type="button"
					onclick={onReport}
					class="text-gray-300 hover:text-gray-400 flex-shrink-0 mt-0.5 dm-icon-report"
					aria-label="Frage melden"
				>
					<Icon icon="tabler:flag-3" class="w-5 h-5" />
				</button>
			</div>

			{#if question.image}
				<button
					type="button"
					onclick={() => (lightboxOpen = true)}
					class="block mb-5 cursor-zoom-in focus:outline-none mx-auto"
					aria-label="Bild vergrößern"
				>
					<img
						src={question.image}
						alt="Frage Bild"
						class="rounded-xl h-28 sm:h-52 w-auto object-contain"
					/>
				</button>

				{#if lightboxOpen}
					<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
					<div
						class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
						onclick={() => (lightboxOpen = false)}
					>
						<button
							type="button"
							onclick={() => (lightboxOpen = false)}
							class="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/60 rounded-full w-9 h-9 flex items-center justify-center text-xl leading-none"
							aria-label="Schließen"
						>×</button>
						<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
						<img
							src={question.image}
							alt="Frage Bild"
							class="max-w-full max-h-full rounded-xl object-contain shadow-2xl"
							onclick={(e) => e.stopPropagation()}
						/>
					</div>
				{/if}
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
	</div>

	<!-- Zone 3: Fixed action bar -->
	<div class="shrink-0 border-t-2 border-gray-200 bg-white py-4 px-5 sm:py-5 sm:px-8 dm-action-bar">
		{#if answerChecked}
			<div class="flex items-center gap-3 mb-4">
				<Icon
					icon={isCorrect ? 'tabler:check' : 'tabler:x'}
					class="w-10 h-10 shrink-0 {isCorrect ? 'text-green-500' : 'text-red-400'}"
				/>
				<span class="text-base font-semibold {isCorrect ? 'text-green-800 dm-feedback-ok' : 'text-red-700 dm-feedback-err'}">
					{isCorrect ? 'Richtig!' : 'Nicht ganz.'}
				</span>
			</div>
		{/if}

		<div class="flex gap-3">
			<button
				type="button"
				onclick={answerChecked ? onExplain : onHint}
				class="h-10 sm:h-11 px-4 flex items-center gap-2 rounded-lg border-2 border-b-4 border-gray-300 bg-white text-primary hover:bg-gray-50 font-medium text-sm transition-all shrink-0 dm-hint-btn"
			>
				<Icon
					icon={answerChecked ? 'tabler:book-2' : 'tabler:bulb'}
					class="w-4 h-4"
				/>
				<span class="max-sm:hidden">{answerChecked ? 'Erklärung' : 'Hinweis'}</span>
			</button>

			<button
				onclick={answerChecked ? onNext : onCheck}
				disabled={!answerChecked && selected.length === 0 && hasCorrectAnswers()}
				class="ml-auto px-8 h-10 sm:h-11 bg-primary border-2 border-b-4 border-primary-800 text-white font-semibold rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-primary-700 text-base"
			>
				{answerChecked ? 'Weiter' : 'Prüfen'}
			</button>
		</div>
	</div>
</div>
