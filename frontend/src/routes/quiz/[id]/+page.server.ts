import type { PageServerLoad } from './$types';

type RawQuestion = {
    id: string;
    question: string;
    type: 'single_choice' | 'multiple_choice';
    question_image?: string;
    hint?: string;
    hint_image?: string;
    explanation?: string;
    explanation_image?: string;
};

type RawQuestionOption = {
    id: string;
    question: string;
    text: string;
    is_correct: boolean;
};

function shuffleInPlace<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

export const load: PageServerLoad = async ({ params, locals }) => {
    const submodule = await locals.pb.collection('submodules').getOne(params.id);
    const module = await locals.pb.collection('modules').getOne(submodule.module);

    const rawQuestions = (await locals.pb.collection('questions').getFullList({
        filter: `submodule = "${params.id}"`,
        sort: 'created'
    })) as RawQuestion[];

    if (rawQuestions.length === 0) {
        return { submodule, questions: [] };
    }

    const optionFilter = rawQuestions.map((question) => `question = "${question.id}"`).join(' || ');
    const rawOptions = (await locals.pb.collection('question_options').getFullList({
        filter: optionFilter
    })) as RawQuestionOption[];

    const optionsByQuestion = new Map<string, RawQuestionOption[]>();

    for (const option of rawOptions) {
        const list = optionsByQuestion.get(option.question) ?? [];
        list.push(option);
        optionsByQuestion.set(option.question, list);
    }

    const questions = rawQuestions.map((q) => {
        const options = shuffleInPlace([...(optionsByQuestion.get(q.id) ?? [])]);
        const answers = options.filter((option) => option.is_correct).map((option) => option.id);

        return {
            id: q.id,
            text: q.question,
            type: q.type,
            options: options.map((option) => ({
                id: option.id,
                text: option.text
            })),
            answers,
            ...(q.question_image && { image: `/api/files/pbc_4009210445/${q.id}/${q.question_image}` }),
            ...(q.hint && { hint: q.hint }),
            ...(q.hint_image && { hintImage: `/api/files/pbc_4009210445/${q.id}/${q.hint_image}` }),
            ...(q.explanation && { explanation: q.explanation }),
            ...(q.explanation_image && { explanationImage: `/api/files/pbc_4009210445/${q.id}/${q.explanation_image}` })
        };
    });

    return { submodule, module, questions };
};
