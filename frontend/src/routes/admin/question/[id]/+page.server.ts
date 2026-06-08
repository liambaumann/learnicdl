import { pb } from '$lib/pb';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
    const question = await pb.collection('questions').getOne(params.id);
    const options = await pb.collection('question_options').getFullList({ filter: `question = "${params.id}"` });

    return { question, options };
};

export const actions = {
    default: async ({ request, params }) => {
        const data = await request.formData();
        const text = String(data.get('text') || '');
        const type = String(data.get('type') || 'single_choice');

        await pb.collection('questions').update(params.id, { text, type });

        throw redirect(303, `/admin/question/${params.id}`);
    }
};
