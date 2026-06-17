import { browser } from '$app/environment';
import { writable } from 'svelte/store';

type Override = 'light' | 'dark' | null;

function getOverride(): Override {
	if (!browser) return null;
	const v = localStorage.getItem('theme-override');
	return v === 'light' || v === 'dark' ? v : null;
}

function computeDark(override: Override): boolean {
	if (override) return override === 'dark';
	return browser ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
}

const _override = writable<Override>(getOverride());
const _dark = writable<boolean>(computeDark(getOverride()));

if (browser) {
	_override.subscribe((v) => {
		const d = computeDark(v);
		_dark.set(d);
		document.documentElement.classList.toggle('dark', d);
	});

	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
		if (localStorage.getItem('theme-override') === null) {
			_dark.set(e.matches);
			document.documentElement.classList.toggle('dark', e.matches);
		}
	});
}

export const dark = { subscribe: _dark.subscribe };

export function toggleTheme() {
	_override.update((v) => {
		const next: Override = computeDark(v) ? 'light' : 'dark';
		if (browser) localStorage.setItem('theme-override', next);
		return next;
	});
}
