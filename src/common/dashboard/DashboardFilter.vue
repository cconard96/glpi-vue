<script setup lang="ts">
    import { useI18n } from "vue-i18n";
    import { computed, defineAsyncComponent } from "vue";

    const props = defineProps<{
        filterKey: string;
        filterValue: any;
    }>();

    const emit = defineEmits<{
        (e: 'update:filterValue', key: string, value: any): void;
        (e: 'clear:filterValue', key: string): void;
    }>();

    const { t: $t } = useI18n();

    //known filters: ["dates","dates_mod","itilcategory","location","manufacturer","requesttype","state","tickettype","group_requester","group_tech","user_tech"]
    const label = computed(() => {
        switch (props.filterKey) {
            case "dates":
                return $t("dashboard.filters.dates", "Creation date");
            case "dates_mod":
                return $t("dashboard.filters.dates_mod", "Last update");
            case "itilcategory":
                return $t("dashboard.filters.itilcategory", "Category");
            case "location":
                return $t("dashboard.filters.location", "Location");
            case "manufacturer":
                return $t("dashboard.filters.manufacturer", "Manufacturer");
            case "requesttype":
                return $t("dashboard.filters.requesttype", "Request source");
            case "state":
                return $t("dashboard.filters.state", "Status");
            case "tickettype":
                return $t("dashboard.filters.tickettype", "Ticket type");
            case "group_requester":
                return $t("dashboard.filters.group_requester", "Group / Requester group");
            case "group_tech":
                return $t("dashboard.filters.group_tech", "Technician group / Assigned group");
            case "user_tech":
                return $t("dashboard.filters.user_tech", "Technician");
            default:
                return props.filterKey;
        }
    });

    const initialValue = computed(() => {
        if (props.filterKey === "dates" || props.filterKey === "dates_mod") {
            return props.filterValue?.length === 2 ? [new Date(props.filterValue[0]), new Date(props.filterValue[1])] : null;
        }
        return props.filterValue;
    });

    const onFilterChange = (newValue: any) => {
        if (['dates', 'dates_mod'].includes(props.filterKey)) {
            if (newValue && newValue.length === 2 && newValue[0] && newValue[1]) {
                // only emit when the selection is finished
                const startDate = new Date(newValue[0]);
                const endDate = new Date(newValue[1]);
                emit('update:filterValue', props.filterKey, [startDate.toISOString(), endDate.toISOString()]);
            }
            return;
        }
        emit('update:filterValue', props.filterKey, newValue);
    };

    const onClearFilter = () => {
        emit('clear:filterValue', props.filterKey);
    };
</script>

<template>
    <component v-if="props.filterKey === 'dates' || props.filterKey === 'dates_mod'" :is="defineAsyncComponent(() => import('@cjdevstudios/bumblevue/datepicker'))"
               :defaultValue="initialValue" selectionMode="range" @value-change="onFilterChange" showClear @clear-click="onClearFilter"></component>
</template>

<style scoped>

</style>