<script lang="ts">
    import { enhance } from '$app/forms';

    let { form } = $props();
</script>

<div class="font-montserrat max-w-2xl mx-auto p-6">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Anmelden</h2>
        <p class="text-gray-500 mb-6">Bitte melden Sie sich an, um weiter zu Lernen.</p>

        <form method="POST" use:enhance class="space-y-5">
            <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
                    placeholder="name@school.at"
                />
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
                <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
                    placeholder="••••••••"
                />
            </div>

            {#if form?.error}
                <p class="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{form.message}</p>
            {/if}

            <button
                type="submit"
                class="w-full rounded-xl bg-primary-600 px-4 py-2.5 mt-4 text-white font-semibold hover:bg-primary-700 active:bg-primary-800 transition cursor-pointer"
            >
                Anmelden
            </button>
        </form>
    </div>
</div>