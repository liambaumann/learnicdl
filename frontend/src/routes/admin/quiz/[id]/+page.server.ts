import { pb } from '$lib/pb';
import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
    const submodule = await pb.collection('submodules').getOne(params.id);
    const questions = await pb.collection('questions').getFullList({
        filter: `submodule = "${params.id}"`,
        sort: 'created'
    });

    return { submodule, questions };
};

export const actions: Actions = {
    delete: async ({ request, params, locals }) => {
        const data = await request.formData();
        const qid = String(data.get('questionId') || '');

        if (!qid) return fail(400, { error: true, message: 'questionId required' });

        const pbClient = locals.pb || pb;
        if (!pbClient?.authStore?.isValid) return fail(401, { error: true, message: 'Not authenticated' });

        const isRedirect = (e: any) => !!(e && typeof e === 'object' && ('status' in e) && (e.status >= 300) && ('location' in e));

        try {
            console.info('Deleting question', { qid, paramsId: params.id });

            // verify question exists
            try {
                await pbClient.collection('questions').getOne(qid);
            } catch (getErr: any) {
                console.error('Question not found', getErr);
                return fail(404, { error: true, message: 'Question not found' });
            }

            // delete options for the question first (sequential)
            const opts = await pbClient.collection('question_options').getFullList({ filter: `question = "${qid}"` });
            for (const o of opts) {
                await pbClient.collection('question_options').delete(o.id);
            }

            // delete the question
            await pbClient.collection('questions').delete(qid);

            // redirect back to questions list
            throw redirect(303, `/admin/quiz/${params.id}`);
        } catch (err: any) {
            if (isRedirect(err)) throw err;
            console.error('Failed deleting question', err);
            const msg = err?.data ? JSON.stringify(err.data) : err?.message || String(err);
            return fail(500, { error: true, message: `Failed to delete: ${msg}` });
        }
    }
};
