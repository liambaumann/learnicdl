import { pb } from '$lib/pb';
import { fail, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { readQuestionFormFields, validateQuestionForm, extractFile, formatPbError } from '$lib/server/questionForm';

export const load: PageServerLoad = async ({ params, locals }) => {
    const pbClient = locals.pb || pb;

    // validate ID format before interpolating into a filter string
    if (!/^[a-zA-Z0-9]{1,20}$/.test(params.id)) {
        error(400, 'Invalid question ID');
    }

    const question = await pbClient.collection('questions').getOne(params.id);
    const options = await pbClient.collection('question_options').getFullList({
        filter: `question = "${params.id}"`,
        sort: 'created'
    });

    const fileUrl = (filename: string) =>
        filename ? `/api/files/${question.collectionId}/${question.id}/${filename}` : '';

    const imageUrl = fileUrl(question.question_image);
    const hintImageUrl = fileUrl(question.hint_image);
    const explanationImageUrl = fileUrl(question.explanation_image);

    return { question, options, imageUrl, hintImageUrl, explanationImageUrl };
};

export const actions: Actions = {
    default: async ({ request, params, locals }) => {
        const pbClient = locals.pb || pb;

        if (!pbClient?.authStore?.isValid) {
            return fail(401, { error: true, message: 'Not authenticated' });
        }

        const data = await request.formData();
        const { text, type, hint, explanation } = readQuestionFormFields(data);

        // option IDs are passed as hidden inputs so we don't need an extra DB read
        const optionIds: string[] = [];
        for (let i = 0; i < 4; i++) {
            const id = data.get(`option_id_${i}`);
            if (id) optionIds.push(String(id));
        }

        const options = optionIds.map((_, i) => ({
            text: String(data.get(`option_text_${i}`) || '').trim(),
            is_correct:
                type === 'single_choice'
                    ? String(data.get('correct')) === String(i)
                    : data.get(`correct_${i}`) === 'on'
        }));

        const validationError = validateQuestionForm({ text, type, options });
        if (validationError) {
            return fail(400, { error: true, message: validationError });
        }

        const fileUpdate = (fieldName: string) => {
            const newFile = extractFile(data, fieldName);
            const remove = data.get(`remove_${fieldName}`) === '1';
            return newFile ? { [fieldName]: newFile } : remove ? { [fieldName]: null } : {};
        };

        try {
            await pbClient.collection('questions').update(params.id, {
                question: text,
                type,
                hint,
                explanation,
                answers: optionIds.filter((_, i) => options[i].is_correct),
                ...fileUpdate('question_image'),
                ...fileUpdate('hint_image'),
                ...fileUpdate('explanation_image')
            });

            for (let i = 0; i < optionIds.length; i++) {
                await pbClient.collection('question_options').update(optionIds[i], {
                    text: options[i].text,
                    is_correct: options[i].is_correct
                });
            }
        } catch (err: any) {
            return fail(400, { error: true, message: `Failed to update: ${formatPbError(err)}` });
        }

        return { success: true };
    }
};
