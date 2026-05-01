<script setup lang="ts">
    import { Button, DataView } from 'primevue';
</script>

<template>
    <section>
        <div class="w-full flex justify-center gap-2">
            <Button icon="ti ti-upload" :label="$t('rules.import', 'Import')" variant="outlined"></Button>
            <Button icon="ti ti-download" :label="$t('rules.export', 'Export')" variant="outlined"></Button>
        </div>
        <div class="grid grid-cols-2 justify-items-center">
            <div>
                <h2 class="text-heading-1">
                    <i class="ti ti-cloud-download" aria-hidden="true"></i>
                    {{ $t('rules.inventory_rules', 'Inventory rules') }}
                </h2>
                <DataView>

                </DataView>
            </div>
            <div>
                <h2 class="text-heading-1">
                    <i class="ti ti-book" aria-hidden="true"></i>
                    {{ $t('rules.other_rules', 'Other rules') }}
                </h2>
                <DataView>

                </DataView>
            </div>
        </div>
    </section>
</template>

<style scoped>

</style>