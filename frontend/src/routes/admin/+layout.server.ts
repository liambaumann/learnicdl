import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
    if (!locals.user) {
        throw redirect(303, `/login?redirectTo=${url.pathname}`);
    }

    if (locals.user.role !== 'admin') {
        throw error(404, 'Not found');
    }

    return {
        user: locals.user
    };
};