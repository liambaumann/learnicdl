import { pb } from '$lib/pb';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const submodule = await pb.collection('submodules').getOne(params.id);
    const questions = await pb.collection('questions').getFullList({
        filter: `submodule = "${params.id}"`,
        sort: 'created'
    });

    return { submodule, questions };
};
