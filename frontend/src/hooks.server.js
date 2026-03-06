import PocketBase from 'pocketbase';

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {
    // 1. Initialize PocketBase
    event.locals.pb = new PocketBase('http://127.0.0.1:8090');

    // 2. Load the auth store from the cookie in the browser
    event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

    try {
        // 3. If the cookie is valid, refresh the session to get latest user data
        if (event.locals.pb.authStore.isValid) {
            await event.locals.pb.collection('users').authRefresh();
            event.locals.user = structuredClone(event.locals.pb.authStore.model);
        }
    } catch (_) {
        // 4. If the token is expired or invalid, clear it
        event.locals.pb.authStore.clear();
        event.locals.user = undefined;
    }

    const response = await resolve(event);

    // 5. Export the current auth state back to a cookie so the browser remembers it
    // Set 'secure: true' in production (HTTPS)
    response.headers.append('set-cookie', event.locals.pb.authStore.exportToCookie({ httpOnly: true, secure: false }));

    return response;
};