import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const modules = await locals.pb.collection('modules').getFullList({
        sort: 'sortOrder',
    });

    const sorted = [
        ...modules.filter(m => m.sortOrder !== 0),
        ...modules.filter(m => m.sortOrder === 0),
    ];

    return { modules: sorted };
};
