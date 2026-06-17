<script lang="ts">
	import { dark, toggleTheme } from '$lib/theme';
	import Icon from '@iconify/svelte';
</script>

<button
	type="button"
	onclick={toggleTheme}
	aria-label={$dark ? 'Zu Hell wechseln' : 'Zu Dunkel wechseln'}
	class="inline-flex items-center justify-center w-9 h-9 rounded-lg border-2 border-b-4 border-primary-800 text-white/70 hover:text-white hover:bg-primary-700 transition-all dm-toggle dm-toggle-btn"
>
	<Icon icon={$dark ? 'tabler:moon' : 'tabler:sun'} class="w-4 h-4" />
</button>
