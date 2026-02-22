export const Colors = {
    primary: '#6849a7',   // main purple — buttons, FAB, active states
    warning: '#cc475a',   // destructive actions, high-urgency alerts

    //   Theme (light / dark)
    dark: {
        text:             '#d4d4d4',
        title:            '#fff',
        background:       '#252231',
        navBackground:    '#201e2b',
        iconColor:        '#9591a5',
        iconColorFocused: '#fff',
        uiBackground:     '#2f2b3d',
    },
    light: {
        text:             '#625f72',
        title:            '#201e2b',
        background:       '#e0dfe8',
        navBackground:    '#e8e7ef',
        iconColor:        '#686477',
        iconColorFocused: '#201e2b',
        uiBackground:     '#d6d5e1',
    },

    //   Incident severity
    severity: {
        high:   '#ff6b6b',   // red
        medium: '#ffd93d',   // yellow
        low:    '#6bcb77',   // green
    },

    // Incident type
    type: {
        protest:      '#e74c3c',
        construction: '#f39c12',
        blockade:     '#27ae60',
        vandalism:    '#8e44ad',
        emergency:    '#cc475a',
    },

    // Badge / status
    badge: {
        verified:         '#27ae60',   // green  — verified by campus
        verifiedBg:       '#27ae6022',
        reported:         '#4a90e2',   // blue   — reported by users
        reportedBg:       '#4a90e222',
        resolved:         '#626262',   // grey   — resolved incidents
        resolvedBg:       '#62626222',
    },

    // Map markers
    marker: {
        building:         '#e74c3c',   // red dot — Concordia buildings
        buildingInner:    '#fff',
    },

    // UI utilities
    overlay:              '#00000066', // modal backdrop
    divider:              '#ffffff33', // subtle separator line
    white:                '#fff',
    black:                '#000',
}