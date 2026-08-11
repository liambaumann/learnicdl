import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
    const submodule = await locals.pb.collection('submodules').getOne(params.id);
    const questions = await locals.pb.collection('questions').getFullList({
        filter: `submodule = "${params.id}"`,
        sort: 'created'
    });

    return { submodule, questions };
};
