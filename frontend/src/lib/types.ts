// frontend/src/lib/types.ts
export interface Option {
	id: string;
	text: string;
}

export interface Question {
	id: string;
	text: string;
	type: 'single_choice' | 'multiple_choice';
	options: Option[];
	answers: string[];
	image?: string;
	hint?: string;
	hintImage?: string;
}
