import { breakpointsBootstrapV5, useBreakpoints, useNetwork } from "@vueuse/core";
import { computed } from "vue";

export function useDeviceCapabilities() {
    const { effectiveType, saveData, isSupported: isNetworkSupported } = useNetwork();
    const breakpoints = useBreakpoints(breakpointsBootstrapV5);

    const shouldReduceNetworkUsage = computed(() => {
        if (!isNetworkSupported.value) {
            return false;
        }
        return saveData.value || effectiveType.value === "4g";
    });

    const isMobileScreenSize = breakpoints.smaller('md');

    return {
        shouldReduceNetworkUsage,
        isMobileScreenSize,
    }
}