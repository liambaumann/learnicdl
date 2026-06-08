import { pb } from '$lib/pb';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const modules = await pb.collection('modules').getFullList({
        sort: '-created',
    });

    return { modules };
};
