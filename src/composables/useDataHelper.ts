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

    function getObjectProp(obj: object, path: string): any {
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
     * @param format The format to use with Intl.DurationFormat. narrow: "1h 30m", short: "1 hr 30 min", long: "1 hour, 30 minutes"
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

    /**
     * Format a timestamp to a relative time (e.g. "5 minutes ago") if the difference between the current time and the timestamp is less than the given cutoff, otherwise return the absolute time (e.g. "2024-01-01 12:00:00").
     * @param timestamp The timestamp to format, in a format that can be parsed by the JavaScript Date object (e.g. "2024-01-01T12:00:00Z").
     * @param relativeCutoff The cutoff in seconds for when to switch from relative time (e.g. "5 minutes ago") to absolute time (e.g. "2024-01-01 12:00:00").
     * If the difference between the current time and the timestamp is greater than this cutoff, the function will return the absolute time instead of the relative time.
     * Defaults to 24 hours.
     */
    function formatRelativeTime(timestamp: number|string|Date, relativeCutoff: number = 24 * 60 * 60): string {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // difference in seconds

        if (relativeCutoff !== undefined && diff > relativeCutoff) {
            return date.toLocaleString();
        }

        if (diff < 15) {
            return 'Just now';
        }

        if (diff < 60) return `${diff} seconds ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
        return date.toLocaleString();
    }

    function formatDate(timestamp: string|number, formatOptions: Intl.DateTimeFormatOptions = undefined): string {
        //TODO create a Intl.DateTimeFormat and use it for all date/time formatting functions to improve performance. Ideally it would be reactive and change if the user language changes (although maybe that would require a page reload anyways...)

        // If the timestamp is only a date, the JavaScript Date object will interpret it as being in UTC and convert it to the local timezone, which can result in the wrong date being displayed.
        // To prevent this, we can check if the timestamp is in the format "YYYY-MM-DD" and if so, append "T00:00:00" to it before creating the Date object.
        if (/^\d{4}-\d{2}-\d{2}$/.test(timestamp)) {
            timestamp += 'T00:00:00';
        }
        const date = new Date(timestamp);
        return date.toLocaleDateString(undefined, formatOptions);
    }

    function formatTime(timestamp: string|number): string {
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
    }

    function formatDateTime(timestamp: string|number): string {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    function formatCost(cost: number, currency: string = undefined): string {
        if (currency === undefined) {
            // just format the number to always include 2 decimal places and use the user's locale for formatting
            // maybe GLPI will support currency units at some point
            return cost.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        return new Intl.NumberFormat(navigator.language, { style: 'currency', currency }).format(cost);
    }

    /**
     * @param maskedInput A string in the format "HH:MM" representing a duration
     * @returns The duration in seconds
     */
    function getDurationFromMaskedInput(maskedInput: string): number {
        const [hours, minutes] = maskedInput.split(':').map(part => parseInt(part));
        return (hours * 60 + minutes) * 60;
    }

    /**
     * Convert a duration in seconds to a masked input string in the format "HH:MM"
     * @param duration The duration in seconds
     */
    function getMaskedInputFromDuration(duration: number): string {
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    return {
        formatDataSize,
        getObjectProp,
        getUsedPercentage,
        formatDataSpeed,
        formatUsername,
        getUrgencyImpactPriorityLabel,
        formatDuration,
        formatRelativeTime,
        formatDate,
        formatTime,
        formatDateTime,
        formatCost,
        getDurationFromMaskedInput,
        getMaskedInputFromDuration,
    }
}