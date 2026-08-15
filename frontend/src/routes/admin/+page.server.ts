import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { pb } from '$lib/pb';

type ModuleRecord = {
	id: string;
	title: string;
	description?: string;
	icon?: string;
	name?: string;
};

type SubmoduleRecord = {
	id: string;
	title: string;
	description?: string;
	module: string;
};

export const load: PageServerLoad = async ({ locals }) => {
	const [modules, submodules, questions] = await Promise.all([
		locals.pb.collection('modules').getFullList({
			sort: 'title'
		}),
		locals.pb.collection('submodules').getFullList({
			sort: 'title'
		}),
		locals.pb.collection('questions').getFullList({
			fields: 'id,submodule'
		})
	]);

	const submodulesByModule = new Map<string, SubmoduleRecord[]>();

	for (const submodule of submodules as SubmoduleRecord[]) {
		const grouped = submodulesByModule.get(submodule.module) ?? [];
		grouped.push(submodule);
		submodulesByModule.set(submodule.module, grouped);
	}

	// Question + answer-option counts per submodule, for the delete-confirmation
	// warning - two batched queries total, not one per submodule.
	const questionCountBySubmodule: Record<string, number> = {};
	const submoduleByQuestion: Record<string, string> = {};
	for (const q of questions as { id: string; submodule: string }[]) {
		questionCountBySubmodule[q.submodule] = (questionCountBySubmodule[q.submodule] ?? 0) + 1;
		submoduleByQuestion[q.id] = q.submodule;
	}

	const optionCountBySubmodule: Record<string, number> = {};
	if (questions.length) {
		const filter = (questions as { id: string }[]).map((q) => `question = "${q.id}"`).join(' || ');
		const options = await locals.pb.collection('question_options').getFullList({
			filter,
			fields: 'question'
		});
		for (const o of options as { question: string }[]) {
			const submoduleId = submoduleByQuestion[o.question];
			if (!submoduleId) continue;
			optionCountBySubmodule[submoduleId] = (optionCountBySubmodule[submoduleId] ?? 0) + 1;
		}
	}

	return {
		modules: modules as ModuleRecord[],
		submodulesByModule: Object.fromEntries(submodulesByModule),
		questionCountBySubmodule,
		optionCountBySubmodule
	};
};

export const actions: Actions = {
	createSubmodule: async ({ request, locals }) => {
		const data = await request.formData();
		const title = String(data.get('title') || '').trim();
		const moduleId = String(data.get('module') || '').trim();

		if (!title) {
			return fail(400, { error: true, message: 'Title is required.', moduleId });
		}
		if (!moduleId) {
			return fail(400, { error: true, message: 'Module is required.' });
		}

		const pbClient = locals.pb || pb;
		if (!pbClient?.authStore?.isValid) {
			return fail(401, { error: true, message: 'Not authenticated', moduleId });
		}

		try {
			await pbClient.collection('modules').getOne(moduleId);
		} catch {
			return fail(400, { error: true, message: `Module ${moduleId} not found`, moduleId });
		}

		try {
			await pbClient.collection('submodules').create({ title, module: moduleId });
		} catch (err: any) {
			const message = err?.data ? JSON.stringify(err.data) : err?.message || String(err);
			return fail(400, { error: true, message: `Failed to create submodule: ${message}`, moduleId });
		}

		return { success: true, moduleId };
	}
};
