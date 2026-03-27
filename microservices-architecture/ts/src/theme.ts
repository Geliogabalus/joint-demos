/** Color tokens used across models, views, and UI components. */
export const colors = {
    // Primary / accent
    primary: '#4a7cc9',
    primaryHighlight: '#2f7ed8',
    selectionStroke: '#80bdff',
    danger: '#ff6b6b',

    // Elements
    elementFill: '#FFFFFF',
    elementStroke: '#999999',
    elementLabelFill: '#666666',

    // Groups
    groupFill: '#FFFFFF',
    groupStroke: '#999999',
    groupLabelFill: '#888888',

    // Containers (defaults, overridden per-container by palette)
    containerFill: '#D5E8D4',
    containerStroke: '#B8D4B0',
    containerHeaderFill: '#C3DCC1',
    containerLabelFill: '#444',

    // Links
    linkStroke: '#444',

    // Add-container button
    addButtonFill: '#f3f3f3',
    addButtonStroke: '#bbb',
    addButtonIconFill: '#888',

    // Navigator
    navigatorContainerFill: '#ddd',
    navigatorContainerStroke: '#aaa',
    navigatorElementFill: '#999',
};

/** Rotating fill colors assigned to new containers. */
export const containerPalette = [
    '#D5E8D4', '#DAE8FC', '#FFF2CC', '#F8CECC',
    '#E1D5E7', '#D5E8D4', '#FFE6CC', '#F5F5F5',
    '#DCEEFB', '#E6D0DE', '#CDE6C7', '#FBE5D6'
];

// --- Icons (Lucide, inline SVG data URIs) ---

function lucideIcon(path: string, color = colors.primary): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/** Lucide icon data URIs for halo and selection handles. */
export const icons = {
    remove: lucideIcon('<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>'),
    clone: lucideIcon('<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'),
    link: lucideIcon('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
    fork: lucideIcon('<circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9"/><path d="M12 12v3"/>'),
    resize: lucideIcon('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>'),
    unlink: lucideIcon('<path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"/><path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"/><line x1="8" y1="2" x2="8" y2="5"/><line x1="2" y1="8" x2="5" y2="8"/><line x1="16" y1="19" x2="16" y2="22"/><line x1="19" y1="16" x2="22" y2="16"/>', colors.danger),
    group: lucideIcon('<path d="M3 7V5c0-1.1.9-2 2-2h2"/><path d="M17 3h2c1.1 0 2 .9 2 2v2"/><path d="M21 17v2c0 1.1-.9 2-2 2h-2"/><path d="M7 21H5c-1.1 0-2-.9-2-2v-2"/><rect width="7" height="5" x="7" y="7" rx="1"/><rect width="7" height="5" x="10" y="12" rx="1"/>'),
    ungroup: lucideIcon('<rect width="8" height="6" x="5" y="4" rx="1"/><rect width="8" height="6" x="11" y="14" rx="1"/>'),
};
