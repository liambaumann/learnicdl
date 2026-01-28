import { pb } from '$lib/pb';
import type { PageLoad } from './$types';

// This function runs on the server (or client during navigation)
export const load: PageLoad = async () => {
    // 1. Fetch all records from the 'quizzes' collection
    const quizzes = await pb.collection('quizzes').getFullList({
        sort: '-created', // Newest first
    });

    // 2. Return them to the Svelte page
    return { quizzes };
};