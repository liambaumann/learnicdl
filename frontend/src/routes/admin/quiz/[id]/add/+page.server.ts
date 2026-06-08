import { pb } from '$lib/pb';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request, params, locals }) => {
        const data = await request.formData();
        const text = String(data.get('text') || '').trim();
        const type = String(data.get('type') || 'single_choice');

        // collect four option texts and correctness flags
        const options: { text: string; is_correct: boolean }[] = [];
        // Determine correctness based on declared question type
        if (type === 'single_choice') {
            const correctIndex = data.get('correct');
            for (let i = 0; i < 4; i++) {
                const optText = String(data.get(`option_${i}`) || '').trim();
                const isCorrect = correctIndex != null && String(correctIndex) === String(i);
                options.push({ text: optText, is_correct: isCorrect });
            }
        } else {
            for (let i = 0; i < 4; i++) {
                const optText = String(data.get(`option_${i}`) || '').trim();
                const isCorrect = data.get(`correct_${i}`) === 'on';
                options.push({ text: optText, is_correct: isCorrect });
            }
        }

        // validate
        if (!text) {
            return fail(400, { error: true, message: 'Question text is required.' });
        }

        const emptyOption = options.find((o) => !o.text);
        if (emptyOption) {
            return fail(400, { error: true, message: 'All four answer options must have text.' });
        }

        // prefer the request-scoped PocketBase instance (with user's auth)
        const pbClient = locals.pb || pb;

        if (!pbClient?.authStore?.isValid) {
            return fail(401, { error: true, message: 'Not authenticated' });
        }

        // ensure the submodule exists
        const isRedirect = (e: any) => !!(e && typeof e === 'object' && ('status' in e) && (e.status >= 300) && ('location' in e));

        try {
            await pbClient.collection('submodules').getOne(params.id);
        } catch (e) {
            return fail(400, { error: true, message: `Submodule ${params.id} not found` });
        }

        try {
            const tempOptionIds = Array.from({ length: options.length }, (_, i) => `tmp_${Math.random().toString(36).slice(2)}_${i}`);
            const tempAnswerIds = tempOptionIds.filter((_, i) => options[i].is_correct);

            const created = await pbClient.collection('questions').create({
                text,
                type,
                submodule: params.id,
                options: tempOptionIds,
                answers: tempAnswerIds
            });

            const createdOptions: any[] = [];
            for (const o of options) {
                const createdOpt = await pbClient.collection('question_options').create({
                    question: created.id,
                    text: o.text,
                    is_correct: o.is_correct
                });
                createdOptions.push(createdOpt);
            }

            const optionIds = createdOptions.map((opt: any) => opt.id);
            const answerIds = createdOptions
                .filter((opt: any, idx: number) => options[idx].is_correct)
                .map((opt: any) => opt.id);

            if (type === 'single_choice') {
                if (answerIds.length !== 1) return fail(400, { error: true, message: 'Single choice questions must have exactly one correct option.' });
            } else {
                if (answerIds.length === 0) return fail(400, { error: true, message: 'At least one option must be marked correct.' });
            }

            await pbClient.collection('questions').update(created.id, { options: optionIds, answers: answerIds });
            throw redirect(303, `/admin/quiz/${params.id}`);
        } catch (err: any) {
            if (isRedirect(err)) throw err;
            console.error('Failed creating question or options', err);
            const message = err?.data ? JSON.stringify(err.data) : err?.message || String(err);
            return fail(400, { error: true, message: `Failed to create record: ${message}` });
        }
    }
};
