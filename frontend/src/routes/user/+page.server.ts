import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	logout: async ({ locals }) => {
		locals.pb.authStore.clear();
		throw redirect(303, '/login');
	}
};
