import { pb } from '$lib/pb';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    // 1. Fetch the Quiz details (Title, Description)
    const quiz = await pb.collection('quizzes').getOne(params.id);

    // 2. Fetch the Questions linked to this Quiz
    const questions = await pb.collection('questions').getFullList({
        filter: `quiz = "${params.id}"`,
        sort: 'created'
    });

    return { quiz, questions };
};