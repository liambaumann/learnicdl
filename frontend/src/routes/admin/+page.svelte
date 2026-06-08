<script lang="ts">
    import AdminModuleList from '$lib/components/AdminModuleList.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<AdminModuleList modules={data.modules} submodulesByModule={data.submodulesByModule} user={data.user} />