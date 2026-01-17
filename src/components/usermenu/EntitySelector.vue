<script setup lang="ts">
    import { Message, TreeSelect, Button } from 'primevue';
    import {computed, onMounted, ref, shallowRef, watch} from "vue";
    import { useApi } from "@/composables/useApi";
    import { useAuth } from "@/composables/useAuth";
    import { useSessionStore } from "@/composables/useSessionStore";

    const entity_tree = shallowRef([]);
    const { doApiRequest } = useApi();
    const { active_entities, active_entity, changeEntity, changeProfile, getActiveProfile, profiles } = useSessionStore();
    const selected_entity = ref(null);
    const selected_entity_recursive = ref(false);
    const selected_profile = ref(null);
    // const is_profile_valid_for_entity = computed(() => {
    //     for (const [profile_id, assignment] of Object.entries(profiles)) {
    //         if (profile_id == getActiveProfile.id) {
    //             console.log(assignment);
    //             for (const ent of assignment.entities) {
    //                 console.log({
    //                     ent,
    //                     selected_entity
    //                 });
    //                 if (ent.id == selected_entity) {
    //                     return true;
    //                 } else if (ent.is_recursive) {
    //                     // get all parent keys of the entity_id from the entity_tree
    //                     let parents = [];
    //                     function findParents(node: any, target_id: number, current_parents: number[] = []): boolean {
    //                         if (node.key == target_id) {
    //                             parents = current_parents;
    //                             return true;
    //                         }
    //                         if (node.children) {
    //                             for (const child of node.children) {
    //                                 if (findParents(child, target_id, [...current_parents, node.key])) {
    //                                     return true;
    //                                 }
    //                             }
    //                         }
    //                         return false;
    //                     }
    //                     for (const root_node of entity_tree.value) {
    //                         findParents(root_node, selected_entity);
    //                     }
    //                     if (parents.includes(ent.id)) {
    //                         return true;
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     return false;
    // });

    onMounted(() => {
        doApiRequest('/Session/EntityTree').then((res) => {
            entity_tree.value = res.data;
        });
    });

    function doChangeEntity(node: any, recursive: boolean = false) {
        selected_entity.value = node.key;
        selected_entity_recursive.value = recursive;
        finalizeEntityChange();
    }

    // watch(is_profile_valid_for_entity, (is_valid) => {
    //     if (is_valid) {
    //         finalizeEntityChange();
    //     }
    // });

    function finalizeEntityChange() {
        changeEntity({
            id: selected_entity.value,
            recursive: selected_entity_recursive.value
        });
        changeProfile({
            id: selected_profile.value || getActiveProfile.id
        });

        useAuth().loadSession().then(() => {
            window.location.reload();
        });
    }
</script>

<template>
    <div>
        <TreeSelect :options="entity_tree" @nodeSelect="doChangeEntity($event)" @nodeUnselect="doChangeEntity($event)" filter
                    selectionMode="single" fluid>
            <template #option="{ node }">
                <div>
                    {{ node.label }}
                    <Button v-if="node.children.length" size="small" variant="outlined" class="ms-2"
                            title="Select child entities" @click.stop="doChangeEntity(node, true)">
                        <i class="ti ti-chevrons-down"></i>
                    </Button>
                </div>
            </template>
        </TreeSelect>
<!--        <template v-if="selected_entity !== null && !is_profile_valid_for_entity">-->
<!--            <Message severity="warn" class="mt-2">-->
<!--                The current profile "{{ getActiveProfile.name }}" is not valid for the selected entity.-->
<!--                <br>-->
<!--                Please select a different profile:-->
<!--            </Message>-->
<!--            <TreeSelect :options="Object.values(profiles).map(profile => ({ label: profile.name, value: profile.id }))"-->
<!--                        v-model="selected_profile" filter selectionMode="single" fluid>-->
<!--            </TreeSelect>-->
<!--        </template>-->
    </div>
</template>

<style scoped>

</style>