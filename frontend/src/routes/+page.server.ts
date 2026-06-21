import { pb } from '$lib/pb';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const modules = await pb.collection('modules').getFullList({
        sort: 'sortOrder',
    });

    const sorted = [
        ...modules.filter(m => m.sortOrder !== 0),
        ...modules.filter(m => m.sortOrder === 0),
    ];

    return { modules: sorted };
};
