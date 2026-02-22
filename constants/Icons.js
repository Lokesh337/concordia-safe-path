export const Icons = {
    // Ionicons name per incident type
    type: {
        protest:      'megaphone',
        construction: 'construct',
        blockade:     'ban',
        vandalism:    'hammer',
        // emergency:    'alert-circle',
    }
}

// Incident types with labels — single source of truth
export const INCIDENT_TYPES = [
    { value: 'protest',      label: 'Protest' },
    { value: 'construction', label: 'Construction' },
    { value: 'blockade',     label: 'Road Blockage' },
    { value: 'vandalism',    label: 'Vandalism' },
    // { value: 'emergency',    label: 'Emergency' },
]