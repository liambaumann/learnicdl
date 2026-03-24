import { pb } from '$lib/pb';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const module = await pb.collection('modules').getOne(params.id);

    // 1. Fetch all records from the 'submodules' collection
    const submodules = await pb.collection('submodules').getFullList({
        filter: `module = "${params.id}"`
    });

    // 2. Return them to the Svelte page
    return { module, submodules };
};