import { sanitizeRichText } from './sanitizeRichText';

export type QuestionOptionInput = { text: string; is_correct: boolean };

export type ParsedQuestionFields = {
    text: string;
    type: string;
    hint: string;
    explanation: string;
};

export function readQuestionFormFields(data: FormData): ParsedQuestionFields {
    return {
        text: String(data.get('text') || '').trim(),
        type: String(data.get('type') || 'single_choice'),
        hint: sanitizeRichText(String(data.get('hint') || '').trim()),
        explanation: sanitizeRichText(String(data.get('explanation') || '').trim())
    };
}

export function validateQuestionForm(fields: {
    text: string;
    type: string;
    options: QuestionOptionInput[];
}): string | null {
    if (!fields.text) {
        return 'Question text is required.';
    }
    if (fields.options.length !== 4 || fields.options.some((o) => !o.text)) {
        return 'All four options must have text.';
    }
    const correctCount = fields.options.filter((o) => o.is_correct).length;
    if (fields.type === 'single_choice' && correctCount !== 1) {
        return 'Single choice must have exactly one correct answer.';
    }
    if (fields.type === 'multiple_choice' && correctCount === 0) {
        return 'At least one option must be marked correct.';
    }
    return null;
}

export function extractFile(data: FormData, fieldName: string): File | null {
    const file = data.get(fieldName);
    return file instanceof File && file.size > 0 ? file : null;
}

export function formatPbError(err: any): string {
    return err?.data ? JSON.stringify(err.data) : err?.message || String(err);
}
