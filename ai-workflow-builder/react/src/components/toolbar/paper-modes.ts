/** Paper-mode model, shared by the canvas-settings menu and the mobile overflow menu. */
export type PaperMode = 'infinite' | 'sheets';

export const PAPER_MODES: readonly { readonly value: PaperMode; readonly label: string }[] = [
    { value: 'infinite', label: 'Infinite canvas' },
    { value: 'sheets', label: 'Sheets' },
];
