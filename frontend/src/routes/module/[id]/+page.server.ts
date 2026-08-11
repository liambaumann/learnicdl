import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
    const module = await locals.pb.collection('modules').getOne(params.id);

    const submodules = await locals.pb.collection('submodules').getFullList({
        filter: `module = "${params.id}"`
    });

    return { module, submodules };
};
