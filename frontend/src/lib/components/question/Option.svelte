<script lang="ts">
	import Check from './Check.svelte';
	import Cross from './Cross.svelte';
	import Tick from './Tick.svelte';

	export let opt: { id: string; text: string };
	export let selected: string[] = [];
	export let answerChecked: boolean = false;	// Checked: if the user submitted "Check Answer"
	export let questionAnswers: string[] = [];
	export let onToggle: (id: string) => void = () => {};
	export let questionType: 'single_choice' | 'multiple_choice' = 'multiple_choice';
</script>

<button
	onclick={() => onToggle(opt.id)}
	class="w-full text-left py-3 px-4 rounded-lg border-2 border-b-4 transition-all duration-200 flex items-center gap-3 text-sm sm:text-base
    {answerChecked
		? questionAnswers.includes(opt.id)
			? 'border-green-500 bg-green-50 text-green-900'
			: selected.includes(opt.id)
				? 'border-red-500 bg-red-50 text-red-900'
				: 'border-gray-200'
		: selected.includes(opt.id)
			? 'border-primary-600 bg-primary-50 text-primary-900'
			: 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'}"
	disabled={answerChecked}
>
	<div
		class="w-5 h-5 border flex items-center justify-center
      {questionType === 'single_choice' ? 'rounded-full' : 'rounded-md'} 
      {answerChecked
			? questionAnswers.includes(opt.id)
				? 'bg-green-500 border-green-500'
				: selected.includes(opt.id)
					? 'bg-red-500 border-red-500'
					: 'border-gray-300 bg-white'
			: selected.includes(opt.id)
				? 'bg-primary-600 border-primary-600'
				: 'border-gray-300 bg-white'}"
	>
		{#if !answerChecked}
			{#if selected.includes(opt.id)}
				{#if questionType === 'single_choice'}
					<div class="w-2 h-2 bg-white rounded-full"></div>
				{:else}
					<Check />
				{/if}
			{/if}
		{:else if questionAnswers.includes(opt.id)}
			{#if questionType === 'single_choice'}
				<Tick />
			{:else}
				<Check />
			{/if}
		{:else if selected.includes(opt.id)}
			<Cross />
		{/if}
	</div>

	{opt.text}
</button>
