<script lang="ts">
  export let opt: { id: string; text: string };
  export let selected: string[] = [];
  export let answerChecked: boolean = false;
  export let questionAnswers: string[] = [];
  export let onToggle: (id: string) => void = () => {};
</script>

<button
  onclick={() => onToggle(opt.id)}
  class="w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-3
    {answerChecked
      ? questionAnswers.includes(opt.id)
        ? 'border-green-500 bg-green-50 text-green-900'
        : selected.includes(opt.id)
          ? 'border-red-400 bg-red-50 text-red-900'
          : 'border-gray-200'
      : selected.includes(opt.id)
        ? 'border-primary-600 bg-primary-50 text-primary-900'
        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'}"
  disabled={answerChecked}
>
  <div
    class="w-5 h-5 rounded-full border flex items-center justify-center
      {answerChecked
        ? questionAnswers.includes(opt.id)
          ? 'bg-green-500 border-green-500'
          : selected.includes(opt.id)
            ? 'bg-red-400 border-red-400'
            : 'border-gray-300 bg-white'
        : selected.includes(opt.id)
          ? 'bg-primary-600 border-primary-600'
          : 'border-gray-300 bg-white'}"
  >
    {#if answerChecked && questionAnswers.includes(opt.id)}
      <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
    {:else if answerChecked && selected.includes(opt.id)}
      <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    {:else if selected.includes(opt.id)}
      <div class="w-2 h-2 bg-white rounded-full"></div>
    {/if}
  </div>

  {opt.text}
</button>
