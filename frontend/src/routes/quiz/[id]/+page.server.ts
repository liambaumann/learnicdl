import { pb } from '$lib/pb';
import type { PageServerLoad } from './$types';

type RawQuestion = {
    id: string;
    text: string;
    type: 'single_choice' | 'multiple_choice';
    image?: string;
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

export const load: PageServerLoad = async ({ params }) => {
    const submodule = await pb.collection('submodules').getOne(params.id);

    const rawQuestions = (await pb.collection('questions').getFullList({
        filter: `submodule = "${params.id}"`,
        sort: 'created'
    })) as RawQuestion[];

    if (rawQuestions.length === 0) {
        return { submodule, questions: [] };
    }

    const optionFilter = rawQuestions.map((question) => `question = "${question.id}"`).join(' || ');
    const rawOptions = (await pb.collection('question_options').getFullList({
        filter: optionFilter
    })) as RawQuestionOption[];

    const optionsByQuestion = new Map<string, RawQuestionOption[]>();

    for (const option of rawOptions) {
        const list = optionsByQuestion.get(option.question) ?? [];
        list.push(option);
        optionsByQuestion.set(option.question, list);
    }

    const questions = rawQuestions.map((question) => {
        const options = shuffleInPlace([...(optionsByQuestion.get(question.id) ?? [])]);
        const answers = options.filter((option) => option.is_correct).map((option) => option.id);

        return {
            id: question.id,
            text: question.text,
            type: question.type,
            options: options.map((option) => ({
                id: option.id,
                text: option.text
            })),
            answers,
            ...(question.image && { image: `${pb.baseUrl}/api/files/pbc_4009210445/${question.id}/${question.image}` })
        };
    });

    return { submodule, questions };
};
