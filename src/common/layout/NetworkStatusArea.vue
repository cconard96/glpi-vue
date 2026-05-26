<script setup lang="ts">
    import { useDataHelper } from "@/common/useDataHelper";
    import { useNetwork } from "@vueuse/core";

    const { formatRelativeTime } = useDataHelper();
    const { saveData, isOnline, offlineAt, effectiveType } = useNetwork();
</script>

<template>
    <div class="h-full p-2 empty:hidden content-center text-sm">
        <div v-if="!isOnline" class="flex flex-col text-red-500">
            <div class="flex gap-2">
                <i class="ti ti-cloud-off"></i>
                <span>{{ $t('network_status.offline', 'Offline') }}</span>
            </div>
            <div>{{ formatRelativeTime(offlineAt) }}</div>
        </div>
        <div v-else-if="(effectiveType ?? '4g') !== '4g'" class="flex flex-col text-yellow-500">
            <div class="flex gap-2">
                <i class="ti ti-cloud-snow"></i>
                <span>{{ $t('network_status.slow_connection', 'Slow connection detected') }}</span>
            </div>
            <div v-if="saveData">{{ $t('network_status.data_saver', 'Data-saver mode active') }}</div>
        </div>
        <div v-else-if="saveData" class="flex flex-col text-green-500">
            <div class="flex gap-2">
                <i class="ti ti-cloud"></i>
                <span>{{ $t('network_status.data_saver', 'Data-saver mode active') }}</span>
            </div>
            <div>Data-saver mode active</div>
        </div>
    </div>
</template>

<style scoped>

</style>