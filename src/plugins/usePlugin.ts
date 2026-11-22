import { ref } from "vue";
import { useIndexedDB } from "@/common/useIndexedDB.ts";

export interface PluginDefinition {
    /** Has this plugin been initizalized/evaluted yet? */
    initialized: boolean;
    /** The internal identifier of the plugin. This is the directory name on the GLPI server and the internal identifier the server uses for it. */
    internalName: string;
    /** Is the plugin installed, active, and exposing its resources via the API? */
    isAvailable: boolean;
    /** Some optional compatibility flags to determine if certain features are available for this plugin. */
    compatFlags: Record<string, boolean>;
}

type InitializedPluginDefinition = PluginDefinition & { initialized: true };

type usePluginReturn = {
    definition: InitializedPluginDefinition;
    isAvailable?: boolean;
}

const plugins = ref<Record<string, PluginDefinition>>({
    tag: {
        initialized: false,
        internalName: 'tag',
        isAvailable: false,
        compatFlags: {},
    },
});

export async function usePlugin(plugin: string): Promise<usePluginReturn> {
    const { getAllOpenAPIComponentNames } = useIndexedDB();

    if (!plugins.value[plugin]) {
        return {
            definition: { initialized: true, internalName: plugin, isAvailable: false, compatFlags: {} },
        }
    }

    if (!plugins.value[plugin].initialized) {
        const componentNames = await getAllOpenAPIComponentNames();
        if (plugin === 'tag' && componentNames.includes(`PluginTag_Tag`)) {
            plugins.value[plugin].isAvailable = true;
        }
        plugins.value[plugin].initialized = true;
    }

    return {
        definition: plugins.value[plugin] as InitializedPluginDefinition,
        isAvailable: plugins.value[plugin].isAvailable,
    }
}