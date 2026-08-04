import { pb } from '$lib/pb';
import { fail, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

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

    const imageUrl = question.image
        ? `${pbClient.baseUrl}/api/files/${question.collectionId}/${question.id}/${question.image}`
        : '';

    return { question, options, imageUrl };
};

export const actions: Actions = {
    default: async ({ request, params, locals }) => {
        const pbClient = locals.pb || pb;

        if (!pbClient?.authStore?.isValid) {
            return fail(401, { error: true, message: 'Not authenticated' });
        }

        const data = await request.formData();
        const text = String(data.get('text') || '').trim();
        const type = String(data.get('type') || 'single_choice');

        // option IDs are passed as hidden inputs so we don't need an extra DB read
        const optionIds: string[] = [];
        for (let i = 0; i < 4; i++) {
            const id = data.get(`option_id_${i}`);
            if (id) optionIds.push(String(id));
        }

        const optionTexts = optionIds.map((_, i) =>
            String(data.get(`option_text_${i}`) || '').trim()
        );

        let correctIds: string[];
        if (type === 'single_choice') {
            const correctId = data.get('correct');
            correctIds = correctId ? [String(correctId)] : [];
        } else {
            correctIds = optionIds.filter((id) => data.get(`correct_${id}`) === 'on');
        }

        // --- validate before touching the DB ---
        if (!text) {
            return fail(400, { error: true, message: 'Question text is required.' });
        }
        if (optionIds.length !== 4 || optionTexts.some((t) => !t)) {
            return fail(400, { error: true, message: 'All four options must have text.' });
        }
        if (type === 'single_choice' && correctIds.length !== 1) {
            return fail(400, { error: true, message: 'Single choice must have exactly one correct answer.' });
        }
        if (type === 'multiple_choice' && correctIds.length === 0) {
            return fail(400, { error: true, message: 'At least one option must be marked correct.' });
        }

        const imageFile = data.get('image');
        const removeImage = data.get('remove_image') === '1';
        const newImage = imageFile instanceof File && imageFile.size > 0 ? imageFile : null;

        try {
            await pbClient.collection('questions').update(params.id, {
                text,
                type,
                answers: correctIds,
                ...(newImage ? { image: newImage } : removeImage ? { image: null } : {})
            });

            for (let i = 0; i < optionIds.length; i++) {
                await pbClient.collection('question_options').update(optionIds[i], {
                    text: optionTexts[i],
                    is_correct: correctIds.includes(optionIds[i])
                });
            }
        } catch (err: any) {
            const message = err?.data ? JSON.stringify(err.data) : err?.message || String(err);
            return fail(400, { error: true, message: `Failed to update: ${message}` });
        }

        return { success: true };
    }
};
