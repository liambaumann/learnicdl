import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
    const submodule = await locals.pb.collection('submodules').getOne(params.id);
    const questions = await locals.pb.collection('questions').getFullList({
        filter: `submodule = "${params.id}"`,
        sort: 'created'
    });

    // Option counts per question, for the delete-confirmation warning - one
    // query for the whole list rather than one per question.
    const optionCounts: Record<string, number> = {};
    if (questions.length) {
        const filter = questions.map((q: { id: string }) => `question = "${q.id}"`).join(' || ');
        const options = await locals.pb.collection('question_options').getFullList({
            filter,
            fields: 'question'
        });
        for (const o of options) {
            optionCounts[o.question] = (optionCounts[o.question] ?? 0) + 1;
        }
    }

    return { submodule, questions, optionCounts };
};
