import PocketBase from 'pocketbase';
import { redirect } from '@sveltejs/kit';

export const handle = async ({ event, resolve }) => {
    event.locals.pb = new PocketBase('http://127.0.0.1:8090');
    event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

    try {
        if (event.locals.pb.authStore.isValid) {
            await event.locals.pb.collection('users').authRefresh();
            event.locals.user = structuredClone(event.locals.pb.authStore.model);
        }
    } catch (_) {
        event.locals.pb.authStore.clear();
        event.locals.user = undefined;
    }

    // --- REDIRECT LOGIC ---
    const isLoginPage = event.url.pathname === '/login';
    const isStaticAsset = event.url.pathname.startsWith('/_app') || event.url.pathname.startsWith('/favicon');

    // If not logged in and not on the login page (and not a static file)
    if (!event.locals.user && !isLoginPage && !isStaticAsset) {
        throw redirect(303, '/login');
    }

    // If ALREADY logged in and trying to go to /login, send them to the home page
    if (event.locals.user && isLoginPage) {
        throw redirect(303, '/');
    }
    // ---------------------------

    const response = await resolve(event);
    response.headers.append('set-cookie', event.locals.pb.authStore.exportToCookie({ httpOnly: true, secure: false }));

    return response;
};