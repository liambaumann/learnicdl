<script lang="ts">
    let {
        existingUrl = '',
        name = 'image',
        onchange
    }: {
        existingUrl?: string;
        name?: string;
        onchange?: () => void;
    } = $props();

    let previewUrl = $state(existingUrl);
    let resolution = $state('');
    let fileSize = $state('');
    let removed = $state(false);

    let fileInput = $state<HTMLInputElement | null>(null);

    function onFileChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const f = input.files?.[0];
        if (!f) return;
        removed = false;
        fileSize = formatSize(f.size);
        resolution = '';
        previewUrl = URL.createObjectURL(f);
        onchange?.();
    }

    function onImgLoad(e: Event) {
        const img = e.target as HTMLImageElement;
        resolution = `${img.naturalWidth} × ${img.naturalHeight}`;
    }

    function remove() {
        previewUrl = '';
        resolution = '';
        fileSize = '';
        removed = true;
        if (fileInput) fileInput.value = '';
        onchange?.();
    }

    function formatSize(bytes: number): string {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
</script>

<input type="file" {name} accept="image/*" class="hidden" bind:this={fileInput} onchange={onFileChange} />
{#if removed}
    <input type="hidden" name="remove_image" value="1" />
{/if}

{#if previewUrl}
    <div class="space-y-2">
        <img
            src={previewUrl}
            alt="Preview"
            onload={onImgLoad}
            class="rounded-xl max-h-48 object-contain"
        />
        <div class="flex items-center gap-2 flex-wrap">
            {#if resolution || fileSize}
                <span class="text-xs text-gray-400">
                    {[resolution, fileSize].filter(Boolean).join(' · ')}
                </span>
            {/if}
            <div class="flex gap-2 ml-auto">
                <button type="button" onclick={() => fileInput?.click()}
                    class="text-xs px-3 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                    Change
                </button>
                <button type="button" onclick={remove}
                    class="text-xs px-3 py-1 rounded-lg border border-red-200 text-red-500 bg-white hover:bg-red-50 transition-colors">
                    Remove
                </button>
            </div>
        </div>
    </div>
{:else}
    <button type="button" onclick={() => fileInput?.click()}
        class="w-full border-2 border-dashed border-gray-200 rounded-xl py-6 text-sm text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors">
        Click to upload image (optional)
    </button>
{/if}
