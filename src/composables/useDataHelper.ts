export function useDataHelper() {
    /**
     * Format memory size to a more readable format in MB, GB, TB, etc.
     */
    function formatDataSize(size: number, base_unit: string): string {
        const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        let index = units.indexOf(base_unit);
        let formatted_size = size;
        while (formatted_size >= 1024 && index < units.length - 1) {
            formatted_size /= 1024;
            index++;
        }
        return `${formatted_size.toFixed(2)} ${units[index]}`;
    }

    function formatDataSpeed(size: number, base_unit: string): string {
        const units = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps', 'Pbps'];
        let index = units.indexOf(base_unit);
        let formatted_size = size;
        while (formatted_size >= 1000 && index < units.length - 1) {
            formatted_size /= 1000;
            index++;
        }
        return `${formatted_size.toFixed(2)} ${units[index]}`;
    }

    function getObjectProp(obj: Object, path: string): any {
        return path.split('.').reduce((o, p) => (o ? o[p] : null), obj);
    }

    function getUsedPercentage(total: number, free: number): string {
        if (total === 0) {
            return '0%';
        }
        return (((total - free) / total) * 100).toFixed(0);
    }

    function formatUsername(user) {
        if (user.firstname && user.realname) {
            return `${user.firstname} ${user.realname}`;
        } else if (user.firstname) {
            return user.firstname;
        } else if (user.realname) {
            return user.realname;
        } else {
            return user.username;
        }
    }

    function getUrgencyImpactPriorityLabel(value: number): string {
        const labels = {
            1: 'Very Low',
            2: 'Low',
            3: 'Medium',
            4: 'High',
            5: 'Very High',
        };
        return labels[value] || 'Unknown';
    }

    return {
        formatDataSize,
        getObjectProp,
        getUsedPercentage,
        formatDataSpeed,
        formatUsername,
        getUrgencyImpactPriorityLabel,
    }
}