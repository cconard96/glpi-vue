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
            return user.username || user.name || 'Unknown User';
        }
    }

    function getUrgencyImpactPriorityLabel(value: number): string {
        const labels = {
            1: 'Very Low',
            2: 'Low',
            3: 'Medium',
            4: 'High',
            5: 'Very High',
            6: 'Major',
        };
        return labels[value] || 'Unknown';
    }

    /**
     * Format duration to a more readable format in seconds, minutes, hours, etc. If the value is 0, return 'N/A'.
     * @param value The raw value
     * @param unit The base unit (ms, s, m, h, d)
     * @param format The format to use with Intl.DurationFormat. narrow: "1h 30m", short: "1 hr 30 min", long: "1 hour 30 minutes"
     */
    function formatDuration(value: number, unit: string, format: 'narrow'|'short'|'long' = 'long'): string {
        if (value === 0) {
            return 'N/A';
        }
        // create a duration object based on the given value and unit. The value needs broken out to the correct units (for example 65 minutes should be 1 hour and 5 minutes)
        const duration = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0,
        };

        // Convert the value to milliseconds based on the unit
        let milliseconds = value;
        switch (unit) {
            case 'd':
                milliseconds *= 24 * 60 * 60 * 1000;
                break;
            case 'h':
                milliseconds *= 60 * 60 * 1000;
                break;
            case 'm':
                milliseconds *= 60 * 1000;
                break;
            case 's':
                milliseconds *= 1000;
                break;
        }

        // break down the milliseconds into the correct units
        duration.days = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
        milliseconds %= 24 * 60 * 60 * 1000;
        duration.hours = Math.floor(milliseconds / (60 * 60 * 1000));
        milliseconds %= 60 * 60 * 1000;
        duration.minutes = Math.floor(milliseconds / (60 * 1000));
        milliseconds %= 60 * 1000;
        duration.seconds = Math.floor(milliseconds / 1000);
        milliseconds %= 1000;
        duration.milliseconds = milliseconds;

        // Use Intl.DurationFormat to format the duration
        const formatter = new Intl.DurationFormat(navigator.language, {
            style: format,
        });
        return formatter.format(duration);
    }

    return {
        formatDataSize,
        getObjectProp,
        getUsedPercentage,
        formatDataSpeed,
        formatUsername,
        getUrgencyImpactPriorityLabel,
        formatDuration,
    }
}