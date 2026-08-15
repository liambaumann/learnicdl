<script lang="ts">
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX_DIMENSION = 1600;
    const WEBP_QUALITY = 0.8;

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
    let errors = $state<string[]>([]);
    let info = $state('');

    let fileInput = $state<HTMLInputElement | null>(null);

    async function compress(bitmap: ImageBitmap, originalName: string): Promise<File> {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
        const width = Math.round(bitmap.width * scale);
        const height = Math.round(bitmap.height * scale);

        if (scale < 1) {
            info = `Info: Bild aufgrund von Größe verkleinert auf neue Dimension ${width} × ${height}px`;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height);

        const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/webp', WEBP_QUALITY);
        });

        resolution = `${width} × ${height}`;
        const baseName = originalName.replace(/\.[^.]+$/, '');
        return new File([blob], `${baseName}.webp`, { type: 'image/webp' });
    }

    async function onFileChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const f = input.files?.[0];
        if (!f) return;

        errors = [];
        info = '';

        const foundErrors: string[] = [];

        if (!ALLOWED_TYPES.includes(f.type)) {
            foundErrors.push('Nur JPEG, PNG oder WebP erlaubt.');
        }

        let bitmap: ImageBitmap | null = null;
        try {
            bitmap = await createImageBitmap(f);
        } catch {
            foundErrors.push('Bild konnte nicht gelesen werden.');
        }

        if (bitmap && bitmap.height > bitmap.width) {
            foundErrors.push('Hochformat nicht erlaubt — nur quadratisch oder Querformat.');
        }

        if (foundErrors.length > 0) {
            errors = foundErrors;
            bitmap?.close();
            input.value = '';
            return;
        }

        let compressed: File;
        try {
            compressed = await compress(bitmap!, f.name);
        } catch {
            errors = ['Bild konnte nicht verarbeitet werden.'];
            bitmap!.close();
            input.value = '';
            return;
        }
        bitmap!.close();

        const dt = new DataTransfer();
        dt.items.add(compressed);
        input.files = dt.files;

        removed = false;
        fileSize = formatSize(compressed.size);
        previewUrl = URL.createObjectURL(compressed);
        onchange?.();
    }

    function onImgLoad(e: Event) {
        if (resolution) return;
        const img = e.target as HTMLImageElement;
        resolution = `${img.naturalWidth} × ${img.naturalHeight}`;
    }

    function remove() {
        previewUrl = '';
        resolution = '';
        fileSize = '';
        removed = true;
        errors = [];
        info = '';
        if (fileInput) fileInput.value = '';
        onchange?.();
    }

    function formatSize(bytes: number): string {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
</script>

<input type="file" {name} accept="image/jpeg,image/png,image/webp" class="hidden" bind:this={fileInput} onchange={onFileChange} />
{#if removed}
    <input type="hidden" name="remove_{name}" value="1" />
{/if}

{#if previewUrl}
    <div class="space-y-2">
        <img
            src={previewUrl}
            alt="Vorschau"
            onload={onImgLoad}
            class="rounded-xl border-2 border-b-4 border-slate-300 max-h-48 object-contain dm-border"
        />
        <div class="flex items-center gap-2 flex-wrap">
            {#if resolution || fileSize}
                <span class="text-xs text-slate-400 dm-text3">
                    {[resolution, fileSize].filter(Boolean).join(' · ')}
                </span>
            {/if}
            <div class="flex gap-2 ml-auto">
                <button type="button" onclick={() => fileInput?.click()}
                    class="inline-flex items-center justify-center h-9 px-4 rounded-lg border-2 border-b-4 border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors dm-card dm-hover dm-border dm-text2">
                    Ändern
                </button>
                <button type="button" onclick={remove}
                    class="inline-flex items-center justify-center h-9 px-4 rounded-lg border-2 border-b-4 border-red-200 text-red-500 bg-white text-sm font-medium hover:bg-red-50 transition-colors dm-btn-danger">
                    Entfernen
                </button>
            </div>
        </div>
    </div>
{:else}
    <button type="button" onclick={() => fileInput?.click()}
        class="w-full border-2 border-dashed border-slate-300 rounded-xl py-6 text-sm text-slate-400 hover:border-slate-400 hover:text-slate-500 transition-colors dm-border dm-text3 dm-hover">
        Zum Hochladen klicken
    </button>
{/if}

{#if info}
    <p class="text-xs text-admin mt-1 dm-text2">{info}</p>
{/if}

{#if errors.length > 0}
    <ul class="text-xs text-red-600 mt-1 space-y-0.5 dm-feedback-err">
        {#each errors as err}
            <li>{err}</li>
        {/each}
    </ul>
{/if}
