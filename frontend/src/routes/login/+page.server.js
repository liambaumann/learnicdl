import { fail, redirect } from '@sveltejs/kit';

export const actions = {
    default: async ({ request, locals }) => {
        const data = await request.formData();
        const email = data.get('email');
        const password = data.get('password');

        try {
            // This is where the magic happens. 
            // PocketBase checks the email and the BCrypt hash.
            await locals.pb.collection('users').authWithPassword(email, password);
        } catch (err) {
            console.error('Login error:', err);
            return fail(400, { 
                error: true, 
                message: 'Invalid email or password.' 
            });
        }

        // If successful, redirect to the home page (where your quizzes are)
        throw redirect(303, '/');
    }
};