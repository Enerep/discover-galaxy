export const STUDY_DESIGN_LABELS = {
  unspecified: 'Not specified',
  perturbation: 'Treatment or perturbation',
  observational: 'Observational comparison',
} as const;

export interface ExperimentContext {
  model: string;
  condition: string;
  design: keyof typeof STUDY_DESIGN_LABELS;
}

export const MAX_CONTEXT_LENGTH = 160;

/** User-declared metadata only; never infer it from filenames, contrast labels or genes. */
export function normalizeExperimentContext(input?: Partial<ExperimentContext>): ExperimentContext {
  if (input !== undefined && (!input || typeof input !== 'object' || Array.isArray(input))) throw new Error('Use text fields for experiment context.');
  const text = (value: unknown, label: string) => {
    if (value === undefined) return '';
    if (typeof value !== 'string' || value.length > MAX_CONTEXT_LENGTH || /[\u0000-\u001f\u007f]/u.test(value)) {
      throw new Error(`${label} must be a single line of up to ${MAX_CONTEXT_LENGTH} characters.`);
    }
    return value.trim();
  };
  const design = input?.design === undefined ? 'unspecified' : input.design;
  if (typeof design !== 'string' || !Object.hasOwn(STUDY_DESIGN_LABELS, design)) throw new Error('Choose a supported study design.');
  return { model: text(input?.model, 'Tissue or cell model'), condition: text(input?.condition, 'Treatment or condition'), design };
}

export function describeExperimentContext(context: ExperimentContext): string {
  const parts = [context.model && `tissue/cell model: ${context.model}`, context.condition && `treatment/condition: ${context.condition}`,
    context.design !== 'unspecified' && `study design: ${STUDY_DESIGN_LABELS[context.design]}`].filter(Boolean);
  return parts.length ? `Researcher-supplied context — ${parts.join('; ')}.` : '';
}
