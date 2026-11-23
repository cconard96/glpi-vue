<script setup lang="ts">
    import { computed, inject, ref, useId, watch } from "vue";
    import { useI18n } from "vue-i18n";
    import Drawer from "@cjdevstudios/bumblevue/drawer";
    import Select from "@cjdevstudios/bumblevue/select";
    import AutoComplete from "@cjdevstudios/bumblevue/autocomplete";
    import Button from "@cjdevstudios/bumblevue/button";
    import ActorAvatar from "@/common/actor/ActorAvatar.vue";
    import { useActorCache } from "@/common/actor/useActorCache";
    import { useApi } from "@/common/api/useApi";
    import { graphQLString, rsqlContains } from "@/common/api/rsql";
    import { useDeviceCapabilities } from "@/common/useDeviceCapabilities";
    import type { KanbanTeamItemtype, KanbanTeamMember } from "@/common/kanban/kanban";
    import type { KanbanInstance } from "@/common/kanban/useKanban";

    interface ActorOption {
        itemtype: KanbanTeamItemtype;
        items_id: number;
        name: string;
    }

    const MAX_CONTENT_LENGTH = 1000;

    const props = defineProps<{
        cardKey: string | null;
    }>();
    const visible = defineModel<boolean>('visible', { required: true });

    const kanban = inject('kanban') as KanbanInstance;
    const { t: $t } = useI18n();
    const id = useId();
    const { doGraphQLRequest } = useApi();
    const { getActor } = useActorCache();
    const { isMobileScreenSize } = useDeviceCapabilities();

    // Look up the card by key so the drawer always shows the latest data after refreshes
    const card = computed(() => props.cardKey ? kanban.findCard(props.cardKey) ?? null : null);
    const card_route = computed(() => card.value ? kanban.adapter.getCardRoute(card.value) : null);
    const content_preview = computed(() => {
        const content = card.value?.content ?? '';
        return content.length > MAX_CONTENT_LENGTH ? `${content.slice(0, MAX_CONTENT_LENGTH)}…` : content;
    });
    const column_options = computed(() => kanban.columnDefs.value.map(c => ({ id: c.id, label: c.label })));

    const itemtype_labels = computed<Record<KanbanTeamItemtype, string>>(() => ({
        User: $t('kanban.team.users', 'Users'),
        Group: $t('kanban.team.groups', 'Groups'),
        Supplier: $t('kanban.team.suppliers', 'Suppliers'),
        Contact: $t('kanban.team.contacts', 'Contacts'),
    }));
    const team_by_type = computed(() => {
        const groups = new Map<KanbanTeamItemtype, KanbanTeamMember[]>();
        for (const member of card.value?.team ?? []) {
            if (!groups.has(member.itemtype)) {
                groups.set(member.itemtype, []);
            }
            groups.get(member.itemtype)!.push(member);
        }
        return groups;
    });

    function getActorData(member: KanbanTeamMember) {
        return getActor(member.itemtype, member.items_id) ?? { id: member.items_id, name: kanban.getMemberName(member) || '?' };
    }

    function changeColumn(column_id: number) {
        if (card.value && column_id !== card.value.column) {
            void kanban.moveCard(card.value.key, column_id, Number.MAX_SAFE_INTEGER);
        }
    }

    // region Team member addition
    const new_member_type = ref<KanbanTeamItemtype>(kanban.adapter.teamItemtypes[0] ?? 'User');
    const new_members = ref<ActorOption[]>([]);
    const actor_suggestions = ref<ActorOption[]>([]);
    const adding = ref(false);

    watch(() => props.cardKey, () => {
        new_members.value = [];
    });

    async function searchActors(event: { query: string }) {
        const type = new_member_type.value;
        const value = graphQLString(rsqlContains(event.query));
        const filter = type === 'User'
            ? `(username=ilike=${value},realname=ilike=${value},firstname=ilike=${value})`
            : `name=ilike=${value}`;
        const fields = type === 'User' ? 'id username realname firstname' : 'id name';
        try {
            const response = await doGraphQLRequest<Record<string, Array<Record<string, any>>>>(
                `query { ${type}(filter: "${filter}", limit: 20) { ${fields} } }`
            );
            const existing = new Set((card.value?.team ?? []).filter(m => m.itemtype === type).map(m => m.items_id));
            actor_suggestions.value = (response.data[type] ?? [])
                .filter(a => !existing.has(a.id))
                .map(a => ({
                    itemtype: type,
                    items_id: a.id,
                    name: type === 'User' ? ([a.firstname, a.realname].filter(Boolean).join(' ') || a.username) : a.name,
                }));
        } catch (e) {
            console.error('Failed to search actors', e);
            actor_suggestions.value = [];
        }
    }

    async function addMembers() {
        if (!card.value || new_members.value.length === 0) {
            return;
        }
        adding.value = true;
        try {
            await kanban.addTeamMembers(card.value, new_members.value.map(m => ({ itemtype: m.itemtype, items_id: m.items_id })));
            new_members.value = [];
        } finally {
            adding.value = false;
        }
    }
    // endregion
</script>

<template>
    <Drawer v-model:visible="visible" :position="isMobileScreenSize ? 'bottom' : 'right'"
            :class="isMobileScreenSize ? 'h-[85vh]!' : 'w-full! sm:w-[28rem]!'">
        <template #header>
            <div v-if="card" class="flex items-center gap-2 min-w-0">
                <i :class="card.icon" aria-hidden="true"></i>
                <div class="flex flex-col min-w-0">
                    <h2 class="font-semibold text-lg wrap-anywhere">{{ card.name }}</h2>
                    <span v-if="card.meta.is_milestone" class="text-sm text-muted-color">
                        <i class="ti ti-directions-filled" aria-hidden="true"></i> {{ $t('kanban.card.milestone', 'Milestone') }}
                    </span>
                    <span v-if="card.is_deleted" class="text-sm text-red-600 dark:text-red-400">{{ $t('kanban.card.deleted', 'Deleted') }}</span>
                </div>
            </div>
        </template>
        <div v-if="card" class="flex flex-col gap-4 h-full">
            <div class="flex flex-col gap-1">
                <label :id="`${id}-status-label`" :for="`${id}-status`" class="font-semibold">{{ $t('kanban.card.status', 'Status') }}</label>
                <Select :inputId="`${id}-status`" :ariaLabelledby="`${id}-status-label`" :modelValue="card.column" :options="column_options" optionValue="id" optionLabel="label"
                        :disabled="card.readonly" fluid @update:modelValue="changeColumn"></Select>
            </div>

            <section v-if="content_preview" class="flex flex-col gap-1">
                <h3 class="font-semibold">{{ $t('common.content', 'Content') }}</h3>
                <p class="whitespace-pre-line wrap-anywhere">{{ content_preview }}</p>
            </section>

            <section class="flex flex-col gap-2">
                <h3 class="font-semibold">{{ $t('kanban.team.title', 'Team') }}</h3>
                <p v-if="card.team.length === 0" class="text-sm text-muted-color">{{ $t('kanban.team.empty', 'No team members') }}</p>
                <div v-for="[itemtype, members] in team_by_type" :key="itemtype" class="flex flex-col gap-1">
                    <h4 class="text-sm text-muted-color">{{ itemtype_labels[itemtype] }}</h4>
                    <ul class="flex flex-col gap-1">
                        <li v-for="member in members" :key="`${member.itemtype}-${member.items_id}`" class="flex items-center gap-2 group/member">
                            <ActorAvatar :actor_type="member.itemtype" :actor_data="getActorData(member)" size="normal" shape="circle"></ActorAvatar>
                            <span class="grow">{{ kanban.getMemberName(member) || `#${member.items_id}` }}</span>
                            <span v-if="member.role" class="text-sm text-muted-color">{{ member.role }}</span>
                            <Button v-if="!card.readonly && member.id" size="small" severity="danger" variant="text" icon="ti ti-x"
                                    :aria-label="$t('kanban.team.remove', { name: kanban.getMemberName(member) }, 'Remove {name} from the team')"
                                    @click="kanban.removeTeamMember(card, member)"></Button>
                        </li>
                    </ul>
                </div>
                <form v-if="!card.readonly" class="flex flex-col gap-2" @submit.prevent="addMembers">
                    <span class="text-sm font-semibold">{{ $t('kanban.team.add', 'Add team members') }}</span>
                    <div class="flex gap-2">
                        <label :id="`${id}-member-type-label`" :for="`${id}-member-type`" class="sr-only">{{ $t('kanban.team.member_type', 'Member type') }}</label>
                        <Select :inputId="`${id}-member-type`" :ariaLabelledby="`${id}-member-type-label`" v-model="new_member_type" class="shrink-0"
                                :options="kanban.adapter.teamItemtypes.map(t => ({ value: t, label: itemtype_labels[t] }))"
                                optionValue="value" optionLabel="label" @change="new_members = []"></Select>
                        <label :for="`${id}-member-search`" class="sr-only">{{ $t('kanban.team.search', 'Search') }}</label>
                        <AutoComplete :inputId="`${id}-member-search`" v-model="new_members" multiple class="grow" fluid
                                      :suggestions="actor_suggestions" optionLabel="name" :delay="300"
                                      :placeholder="$t('kanban.team.search', 'Search')" @complete="searchActors"></AutoComplete>
                    </div>
                    <Button type="submit" size="small" icon="ti ti-user-plus" :label="$t('common.add', 'Add')"
                            :disabled="new_members.length === 0" :loading="adding" class="self-start"></Button>
                </form>
            </section>

            <Button v-if="card_route" as="router-link" :to="card_route" severity="secondary" variant="outlined" icon="ti ti-external-link"
                    :label="$t('kanban.card.open_full_form', 'Open full form')" class="self-start"></Button>
        </div>
    </Drawer>
</template>
