/** What screen readers hear for the slider, e.g. "Vanilla 30%, Pomme 70%". */
export const compareValueText = (pos: number, before: string, after: string) => `${before} ${pos}%, ${after} ${100 - pos}%`;
