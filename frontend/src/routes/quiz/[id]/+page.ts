import { pb } from '$lib/pb';
import type { PageLoad } from './$types';
import { z } from 'zod';

const QuestionSchema = z.object({
    // 1. z.array() expects an array. 
    // 2. .catch([]) says: "If PocketBase sends null or undefined, just give me []".
    // 3. .transform() then filters out nulls inside the array.
    options: z.array(z.any())
        .catch([]) 
        .transform((arr) => arr.filter((item) => item !== null && typeof item === 'object')),

    // If PocketBase sends null, undefined, or non-strings, fallback to []
    answers: z.array(z.string())
        .catch([]) 
}).loose();

export const load: PageLoad = async ({ params }) => {
    const submodule = await pb.collection('submodules').getOne(params.id);

    const rawQuestions = await pb.collection('questions').getFullList({
        filter: `submodule = "${params.id}"`,
        sort: 'created'
    });

    // Parse the data through our updated schema
    const questions = rawQuestions.map((question) => QuestionSchema.parse(question));

    return { submodule, questions };
};