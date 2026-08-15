import { redirect, isRedirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/pb';

export const POST: RequestHandler = async ({ params, locals }) => {
    const pbClient = locals.pb || pb;
    if (!pbClient?.authStore?.isValid) return new Response('Not authenticated', { status: 401 });

    // NOTE: this app authenticates admins via the regular `users` collection
    // (see hooks.server.ts), never as an actual PocketBase superuser -
    // PocketBase's cascadeDelete only fires for superuser-authenticated
    // requests, so a plain `submodules.delete(id)` here would 403 despite
    // cascadeDelete=true on the schema. Deleting explicitly instead, which
    // goes through each collection's own deleteRule (role = admin) that this
    // admin actually satisfies. The confirmation dialog on the client already
    // told the admin how many questions/options this includes before they
    // got here.
    try {
        const questions = await pbClient.collection('questions').getFullList({ filter: `submodule = "${params.id}"` });
        for (const q of questions) {
            const opts = await pbClient.collection('question_options').getFullList({ filter: `question = "${q.id}"` });
            for (const o of opts) {
                await pbClient.collection('question_options').delete(o.id);
            }
            await pbClient.collection('questions').delete(q.id);
        }
        await pbClient.collection('submodules').delete(params.id);
        throw redirect(303, '/admin');
    } catch (err: any) {
        if (isRedirect(err)) throw err;
        console.error('Failed deleting submodule (endpoint)', err);
        let msg: string;
        try {
            msg = err?.data ? JSON.stringify(err.data) : err?.message || String(err);
        } catch {
            msg = String(err);
        }
        return new Response(JSON.stringify({ error: true, message: `Failed to delete: ${msg}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};
