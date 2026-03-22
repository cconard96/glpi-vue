import { computed } from "vue";

//TODO Branding plugin support
export function useBranding() {
    const brandName = computed(() => {
        // This can return different brand names depending on the active entity
        return 'GLPI';
    });

    return {
        brandName,
    }
}