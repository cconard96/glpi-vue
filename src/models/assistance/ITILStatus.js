export class ITILStatus {
    static #statuses = {
        1: {
            key: 'new',
            label: 'New',
            icon: 'ti ti-circle-filled',
            color: '#49bf4d',
        },
        2: {
            key: 'assigned',
            label: 'Processing (Assigned)',
            icon: 'ti ti-circle',
            color: '#49bf4d',
        },
        3: {
            key: 'planned',
            label: 'Processing (Planned)',
            icon: 'ti ti-calendar',
            color: '#1b2f62',
        },
        4: {
            key: 'waiting',
            label: 'Pending',
            icon: 'ti ti-circle-filled',
            color: '#ffa500',
        },
        5: {
            key: 'solved',
            label: 'Solved',
            icon: 'ti ti-circle',
            color: '#000000',
        },
        6: {
            key: 'closed',
            label: 'Closed',
            icon: 'ti ti-circle-filled',
            color: '#000000',
        },
        7: {
            key: 'accepted',
            label: 'Accepted',
            icon: 'ti ti-circle-check-filled',
            color: '#00ff00',
        },
        8: {
            key: 'observe',
            label: 'Review',
            icon: 'ti ti-eye',
            color: '#000000',
        },
        9: {
            key: 'eval',
            label: 'Evaluation',
            icon: 'ti ti-circle',
            color: '#add8e6',
        },
        10: {
            key: 'approval',
            label: 'Approval',
            icon: 'ti ti-help',
            color: '#8cabdb',
        },
        11: {
            key: 'test',
            label: 'Testing',
            icon: 'ti ti-help',
            color: '#ffa500',
        },
        12: {
            key: 'qualif',
            label: 'Qualification',
            icon: 'ti ti-circle',
            color: '#ffa500',
        },
        13: {
            key: 'refused',
            label: 'Refused',
            icon: 'ti ti-circle-x',
            color: '#a72f00',
        },
        14: {
            key: 'canceled',
            label: 'Canceled',
            icon: 'ti ti-ban',
            color: '#000000',
        }
    };

    static getIcon(status_id) {
        return ITILStatus.#statuses[status_id]?.icon || '';
    }

    static getColor(status_id) {
        return ITILStatus.#statuses[status_id]?.color || '#000000';
    }

    static getForSelect(itemtype) {
        const statuses_by_itemtype = {
            'ticket': [1, 10, 2, 3, 4, 5, 6],
            'change': [1, 9, 10, 7, 4, 11, 12, 5, 8, 6, 14, 13],
            'problem': [1, 7, 2, 3, 4, 5, 8, 6],
        };
        return Object.entries(ITILStatus.#statuses).filter(([id, status]) => {
            return statuses_by_itemtype[itemtype]?.includes(parseInt(id));
        }).map(([id, status]) => {
            return {
                key: parseInt(id),
                label: status.label,
            };
        });
    }
}