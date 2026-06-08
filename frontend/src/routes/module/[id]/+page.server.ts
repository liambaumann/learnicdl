import { pb } from '$lib/pb';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const module = await pb.collection('modules').getOne(params.id);

    const submodules = await pb.collection('submodules').getFullList({
        filter: `module = "${params.id}"`
    });

    return { module, submodules };
};
