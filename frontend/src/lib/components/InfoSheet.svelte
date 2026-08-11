<script lang="ts">
	import Icon from '@iconify/svelte';

	let {
		open,
		title,
		text,
		image,
		onClose,
		onImageClick
	}: {
		open: boolean;
		title: string;
		text?: string;
		image?: string;
		onClose: () => void;
		onImageClick?: () => void;
	} = $props();
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
		onclick={onClose}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div
			class="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl dm-card"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-lg font-bold text-gray-900 dm-text">{title}</h3>
				<button
					type="button"
					onclick={onClose}
					class="text-gray-400 hover:text-gray-600 dm-icon-close"
					aria-label="Schließen"
				>
					<Icon icon="tabler:x" class="w-5 h-5" />
				</button>
			</div>

			{#if image}
				<button
					type="button"
					onclick={onImageClick}
					class="block mb-4 cursor-zoom-in mx-auto"
					aria-label="Bild vergrößern"
				>
					<img src={image} alt={title} class="rounded-xl max-h-48 w-auto object-contain" />
				</button>
			{/if}

			{#if text}
				<div class="text-gray-700 dm-text2 leading-relaxed">{@html text}</div>
			{/if}
		</div>
	</div>
{/if}
