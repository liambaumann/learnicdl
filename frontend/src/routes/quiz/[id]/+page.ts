import { pb } from '$lib/pb';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    // 1. Fetch the Module details (Title, Description)
    const module = await pb.collection('modules').getOne(params.id);

    // 2. Fetch the Questions linked to this Module
    const questions = await pb.collection('questions').getFullList({
        filter: `module = "${params.id}"`,
        sort: 'created'
    });

    return { module, questions };
};