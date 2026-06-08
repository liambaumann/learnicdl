import { redirect, isRedirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/pb';

export const POST: RequestHandler = async ({ request, params, locals }) => {
    const data = await request.formData();
    const qid = String(data.get('questionId') || '');

    if (!qid) return new Response('questionId required', { status: 400 });

    const pbClient = locals.pb || pb;
    if (!pbClient?.authStore?.isValid) return new Response('Not authenticated', { status: 401 });

    // verify question exists and delete options + question
    try {
        await pbClient.collection('questions').getOne(qid);

        const opts = await pbClient.collection('question_options').getFullList({ filter: `question = "${qid}"` });
        for (const o of opts) {
            await pbClient.collection('question_options').delete(o.id);
        }

        await pbClient.collection('questions').delete(qid);
        throw redirect(303, `/admin/quiz/${params.id}`);
    } catch (err: any) {
        if (isRedirect(err)) throw err;
        console.error('Failed deleting question (endpoint)', err);
        let msg: string;
        try {
            msg = err?.data ? JSON.stringify(err.data) : err?.message || String(err);
        } catch {
            msg = String(err);
        }
        return new Response(JSON.stringify({ error: true, message: `Failed to delete: ${msg}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};
