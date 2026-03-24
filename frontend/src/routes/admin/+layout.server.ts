import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
if (!locals.user) {
        // We can even pass the URL they were trying to visit, 
        // so they get sent back there after logging in!
        throw redirect(303, `/login?redirectTo=${url.pathname}`);
    }

    // 2. Logged in, but NOT an admin? Trigger your custom +error.svelte page!
    if (locals.user.role !== 'admin') {
        throw error(404, 'Not found'); 
    }

    // 3. Admin confirmed. Let them in.
    return {
        user: locals.user
    };
};