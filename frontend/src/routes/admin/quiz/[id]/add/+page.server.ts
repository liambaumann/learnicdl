import { pb } from '$lib/pb';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { readQuestionFormFields, validateQuestionForm, extractFile, formatPbError } from '$lib/server/questionForm';

export const actions: Actions = {
    default: async ({ request, params, locals }) => {
        const data = await request.formData();
        const { text, type, hint, explanation } = readQuestionFormFields(data);

        const options = Array.from({ length: 4 }, (_, i) => ({
            text: String(data.get(`option_text_${i}`) || '').trim(),
            is_correct:
                type === 'single_choice'
                    ? String(data.get('correct')) === String(i)
                    : data.get(`correct_${i}`) === 'on'
        }));

        // --- validate everything before touching the DB ---
        const validationError = validateQuestionForm({ text, type, options });
        if (validationError) {
            return fail(400, { error: true, message: validationError });
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

        const newImage = extractFile(data, 'question_image');
        const newHintImage = extractFile(data, 'hint_image');
        const newExplanationImage = extractFile(data, 'explanation_image');

        // create question with empty relations first, then fill in once options exist
        let created: any;
        try {
            created = await pbClient.collection('questions').create({
                question: text,
                type,
                hint,
                explanation,
                submodule: params.id,
                options: [],
                answers: [],
                ...(newImage ? { question_image: newImage } : {}),
                ...(newHintImage ? { hint_image: newHintImage } : {}),
                ...(newExplanationImage ? { explanation_image: newExplanationImage } : {})
            });
        } catch (err: any) {
            return fail(400, { error: true, message: `Failed to create question: ${formatPbError(err)}` });
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
            return fail(400, { error: true, message: `Failed to create options: ${formatPbError(err)}` });
        }

        // update question with real relation IDs
        try {
            const optionIds = createdOptions.map((o) => o.id);
            const answerIds = createdOptions.filter((_, i) => options[i].is_correct).map((o) => o.id);
            await pbClient.collection('questions').update(created.id, { options: optionIds, answers: answerIds });
        } catch (err: any) {
            return fail(400, { error: true, message: `Failed to link options to question: ${formatPbError(err)}` });
        }

        return { success: true, quizId: params.id };
    }
};
