import { fail, redirect } from '@sveltejs/kit';
import { ClientResponseError } from 'pocketbase';
import { AUTH_COOKIE_NAME } from '$lib/auth';

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request, locals, url, cookies }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		try {
			// authenticate user in pocketbase
			await locals.pb.collection('users').authWithPassword(email, password);
		} catch (err) {
			const status = err instanceof ClientResponseError ? err.status : 500;

			/*
			Wrong login data can cause 400 as well as 404
			everything else (0, 500, 503) the server is offline
		  */
			if (status === 400 || status === 404) {
				return fail(400, {
					error: true,
					message: 'Email oder Passwort sind leider falsch.'
				});
			}

			//if we reach here, like a server / network error
			console.error('System error during login:', err);
			return fail(503, {
				error: true,
				message: 'Anmeldung aktuell nicht möglich. Bitte versuche Sie es später erneut.'
			});
		}

		const record = locals.pb.authStore.record ? JSON.parse(JSON.stringify(locals.pb.authStore.record)) : null;
		cookies.set(
			AUTH_COOKIE_NAME,
			JSON.stringify({
				token: locals.pb.authStore.token,
				record
			}),
			{
				path: '/',
				httpOnly: true,
				secure: false,
				sameSite: 'lax'
			}
		);

		const redirectTo = url.searchParams.get('redirectTo');
		const destination = redirectTo?.startsWith('/') ? redirectTo : '/';
		throw redirect(303, destination);
	}
};
