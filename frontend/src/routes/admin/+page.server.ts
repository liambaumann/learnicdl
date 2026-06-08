import { pb } from '$lib/pb';
import type { PageServerLoad } from './$types';

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

export const load: PageServerLoad = async () => {
	const [modules, submodules] = await Promise.all([
		pb.collection('modules').getFullList({
			sort: 'title'
		}),
		pb.collection('submodules').getFullList({
			sort: 'title'
		})
	]);

	const submodulesByModule = new Map<string, SubmoduleRecord[]>();

	for (const submodule of submodules as SubmoduleRecord[]) {
		const grouped = submodulesByModule.get(submodule.module) ?? [];
		grouped.push(submodule);
		submodulesByModule.set(submodule.module, grouped);
	}

	return {
		modules: modules as ModuleRecord[],
		submodulesByModule: Object.fromEntries(submodulesByModule)
	};
};
