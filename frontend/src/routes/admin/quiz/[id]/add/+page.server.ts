import { pb } from '$lib/pb';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request, params, locals }) => {
        const data = await request.formData();
        const text = String(data.get('text') || '').trim();
        const type = String(data.get('type') || 'single_choice');

        // collect options and correctness
        const options: { text: string; is_correct: boolean }[] = [];
        if (type === 'single_choice') {
            const correctIndex = data.get('correct');
            for (let i = 0; i < 4; i++) {
                const optText = String(data.get(`option_${i}`) || '').trim();
                options.push({ text: optText, is_correct: String(correctIndex) === String(i) });
            }
        } else {
            for (let i = 0; i < 4; i++) {
                const optText = String(data.get(`option_${i}`) || '').trim();
                options.push({ text: optText, is_correct: data.get(`correct_${i}`) === 'on' });
            }
        }

        // --- validate everything before touching the DB ---
        if (!text) {
            return fail(400, { error: true, message: 'Question text is required.' });
        }
        if (options.some((o) => !o.text)) {
            return fail(400, { error: true, message: 'All four answer options must have text.' });
        }
        const correctCount = options.filter((o) => o.is_correct).length;
        if (type === 'single_choice' && correctCount !== 1) {
            return fail(400, { error: true, message: 'Single choice questions must have exactly one correct option.' });
        }
        if (type === 'multiple_choice' && correctCount === 0) {
            return fail(400, { error: true, message: 'At least one option must be marked correct.' });
        }

        const pbClient = locals.pb || pb;
        if (!pbClient?.authStore?.isValid) {
            return fail(401, { error: true, message: 'Not authenticated' });
        }

        try {
            await pbClient.collection('submodules').getOne(params.id);
        } catch {
            return fail(400, { error: true, message: `Submodule ${params.id} not found` });
        }

        const imageFile = data.get('image');
        const newImage = imageFile instanceof File && imageFile.size > 0 ? imageFile : null;

        // create question with empty relations first, then fill in once options exist
        let created: any;
        try {
            created = await pbClient.collection('questions').create({
                text,
                type,
                submodule: params.id,
                options: [],
                answers: [],
                ...(newImage ? { image: newImage } : {})
            });
        } catch (err: any) {
            const message = err?.data ? JSON.stringify(err.data) : err?.message || String(err);
            return fail(400, { error: true, message: `Failed to create question: ${message}` });
        }

        // create options one by one, cleaning up on any failure
        const createdOptions: any[] = [];
        try {
            for (const o of options) {
                const opt = await pbClient.collection('question_options').create({
                    question: created.id,
                    text: o.text,
                    is_correct: o.is_correct
                });
                createdOptions.push(opt);
            }
        } catch (err: any) {
            // clean up: delete any options already created, then the question
            for (const opt of createdOptions) {
                await pbClient.collection('question_options').delete(opt.id).catch(() => {});
            }
            await pbClient.collection('questions').delete(created.id).catch(() => {});
            const message = err?.data ? JSON.stringify(err.data) : err?.message || String(err);
            return fail(400, { error: true, message: `Failed to create options: ${message}` });
        }

        // update question with real relation IDs
        try {
            const optionIds = createdOptions.map((o) => o.id);
            const answerIds = createdOptions.filter((_, i) => options[i].is_correct).map((o) => o.id);
            await pbClient.collection('questions').update(created.id, { options: optionIds, answers: answerIds });
        } catch (err: any) {
            const message = err?.data ? JSON.stringify(err.data) : err?.message || String(err);
            return fail(400, { error: true, message: `Failed to link options to question: ${message}` });
        }

        return { success: true, quizId: params.id };
    }
};
