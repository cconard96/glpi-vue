import { useIdle } from "@vueuse/core";
import { onUnmounted, watch } from "vue";

// Consider 5 minutes of inactivity as idle
const { idle } = useIdle(5 * 60 * 1000);

/** A composable version of setInterval that can change its interval dynamically and supports a different interval if the user is idle (useIdle from VueUse) */
export function useInterval(handler: TimerHandler, timeout: Number, idleTimeout: Number = null) {
    let intervalId = null;

    const startInterval = () => {
        if (intervalId !== null) return; // Prevent multiple intervals
        intervalId = setInterval(handler, idle.value ? (idleTimeout || timeout) : timeout);
    };

    const stopInterval = () => {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
    };

    // Watch for changes in idle state and restart the interval with the appropriate timeout
    watch(idle, () => {
        stopInterval();
        startInterval();
    });

    // Start the interval when the composable is used
    startInterval();

    // Clean up the interval when the component is unmounted
    onUnmounted(() => {
        stopInterval();
    });
}