<script lang="ts">
	import Icon from '@iconify/svelte';

	let {
		open,
		title,
		message,
		confirmLabel = 'Löschen',
		cancelLabel = 'Abbrechen',
		onConfirm,
		onCancel
	}: {
		open: boolean;
		title: string;
		message: string;
		confirmLabel?: string;
		cancelLabel?: string;
		onConfirm: () => void;
		onCancel: () => void;
	} = $props();
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
		onclick={onCancel}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div
			class="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dm-card"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="flex items-center justify-between mb-3">
				<div class="flex items-center gap-2">
					<div class="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
						<Icon icon="tabler:alert-triangle" class="w-5 h-5 text-red-600" />
					</div>
					<h3 class="text-lg font-bold text-red-700 dm-text">{title}</h3>
				</div>
				<button
					type="button"
					onclick={onCancel}
					class="text-gray-400 hover:text-gray-600 dm-icon-close"
					aria-label="Schließen"
				>
					<Icon icon="tabler:x" class="w-5 h-5" />
				</button>
			</div>

			<p class="text-sm text-gray-700 dm-text2 leading-relaxed mb-5">{@html message}</p>

			<div class="flex justify-end gap-3">
				<button
					type="button"
					onclick={onCancel}
					class="px-4 py-2 rounded-lg text-gray-700 bg-white border-2 border-b-4 border-gray-300 hover:bg-gray-50 font-medium text-sm transition-colors dm-result-btn"
				>
					{cancelLabel}
				</button>
				<button
					type="button"
					onclick={onConfirm}
					class="px-4 py-2 rounded-lg border-2 border-b-4 border-red-800 bg-red-600 text-white hover:bg-red-700 font-bold text-sm transition-colors"
				>
					{confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}
