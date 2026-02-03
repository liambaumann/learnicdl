// frontend/src/lib/types.ts
export interface Option {
	id: string;
	text: string;
	isCorrect: boolean;
}

export interface Question {
	text: string;
	type: 'single_choice' | 'multiple_choice';
	options: Option[];
}
