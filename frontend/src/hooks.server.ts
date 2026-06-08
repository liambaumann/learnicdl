import PocketBase from 'pocketbase';
import { redirect, type Handle } from '@sveltejs/kit';
import { AUTH_COOKIE_NAME } from '$lib/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const cookieHeader = event.request.headers.get('cookie') || '';
	event.locals.pb = new PocketBase('http://127.0.0.1:8090');
	event.locals.pb.authStore.loadFromCookie(cookieHeader, AUTH_COOKIE_NAME);

	try {
		if (event.locals.pb.authStore.isValid) {
			await event.locals.pb.collection('users').authRefresh();
			event.locals.user = structuredClone(event.locals.pb.authStore.model);
		}
	} catch (_) {
		event.locals.pb.authStore.clear();
		event.locals.user = undefined;
	}

	const isLoginPage = event.url.pathname === '/login';
	const redirectTo = event.url.searchParams.get('redirectTo');

	if (!event.locals.user && !isLoginPage) {
		const target = `${event.url.pathname}${event.url.search}`;
		throw redirect(303, `/login?redirectTo=${encodeURIComponent(target)}`);
	}

	if (event.locals.user && isLoginPage) {
		const destination = redirectTo?.startsWith('/') ? redirectTo : '/';
		throw redirect(303, destination);
	}

	const response = await resolve(event);
	response.headers.append(
		'set-cookie',
		event.locals.pb.authStore.exportToCookie({ httpOnly: true, secure: false }, AUTH_COOKIE_NAME)
	);

	return response;
};