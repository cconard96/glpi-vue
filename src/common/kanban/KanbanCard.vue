<script setup lang="ts">
    import { computed, inject, useTemplateRef } from "vue";
    import { useI18n } from "vue-i18n";
    import { useConfirm } from "@cjdevstudios/bumblevue/useconfirm";
    import Button from "@cjdevstudios/bumblevue/button";
    import TieredMenu from "@cjdevstudios/bumblevue/tieredmenu";
    import AvatarGroup from "@cjdevstudios/bumblevue/avatargroup";
    import Avatar from "@cjdevstudios/bumblevue/avatar";
    import Popover from "@cjdevstudios/bumblevue/popover";
    import ProgressBar from "@cjdevstudios/bumblevue/progressbar";
    import ActorAvatar from "@/common/actor/ActorAvatar.vue";
    import { useActorCache } from "@/common/actor/useActorCache";
    import { useDataHelper } from "@/common/useDataHelper";
    import type { KanbanCard } from "@/common/kanban/kanban";
    import type { KanbanInstance } from "@/common/kanban/useKanban";

    const MAX_TEAM_IMAGES = 3;

    const props = defineProps<{
        card: KanbanCard;
    }>();
    const emit = defineEmits<{
        (e: 'open', card: KanbanCard): void;
    }>();

    const kanban = inject('kanban') as KanbanInstance;
    const { t: $t } = useI18n();
    const confirm = useConfirm();
    const { getActor } = useActorCache();
    const { formatDate } = useDataHelper();
    const menu_el = useTemplateRef('menu');
    const team_overflow_el = useTemplateRef('team_overflow');

    const shown_team = computed(() => props.card.team.slice(0, MAX_TEAM_IMAGES));
    const overflow_team = computed(() => props.card.team.slice(MAX_TEAM_IMAGES));
    const card_route = computed(() => kanban.adapter.getCardRoute(props.card));
    const show_parent = computed(() => kanban.boardId.value <= 0 && props.card.parent);

    function getActorData(itemtype: string, items_id: number) {
        return getActor(itemtype, items_id) ?? { id: items_id, name: kanban.getMemberName({ itemtype: itemtype as 'User', items_id }) || '?' };
    }

    function confirmDelete() {
        const purge = props.card.is_deleted;
        confirm.require({
            message: purge
                ? $t('kanban.card.confirm_purge', { name: props.card.name }, 'Are you sure you want to permanently delete "{name}"?')
                : $t('kanban.card.confirm_delete', { name: props.card.name }, 'Are you sure you want to delete "{name}"?'),
            header: $t('common.confirm.item_deletion_title', 'Danger Zone'),
            icon: 'ti ti-circle-x',
            rejectProps: { label: $t('common.cancel', 'Cancel'), severity: 'secondary', outlined: true },
            acceptProps: { label: purge ? $t('common.purge', 'Delete permanently') : $t('common.delete', 'Delete'), severity: 'danger' },
            accept: () => kanban.deleteCard(props.card),
        });
    }

    const menu_items = computed(() => {
        const items: Array<Record<string, any>> = [];
        if (card_route.value) {
            items.push({ key: 'open', label: $t('kanban.card.goto', 'Go to'), icon: 'ti ti-external-link', route: card_route.value });
        }
        if (!props.card.readonly) {
            const targets = kanban.orderedColumns.value.filter(c => c.id !== props.card.column);
            if (targets.length) {
                items.push({
                    key: 'move',
                    label: $t('kanban.card.move_to', 'Move to'),
                    icon: 'ti ti-arrows-exchange',
                    items: targets.map(c => ({
                        key: `move-${c.id}`,
                        label: c.label,
                        command: () => kanban.moveCard(props.card.key, c.id, Number.MAX_SAFE_INTEGER),
                    })),
                });
            }
        }
        if (kanban.rights.value.canDeleteItem) {
            if (props.card.is_deleted) {
                items.push({ key: 'restore', label: $t('common.restore', 'Restore'), icon: 'ti ti-trash-off', command: () => kanban.restoreCard(props.card) });
                items.push({ key: 'purge', label: $t('common.purge', 'Delete permanently'), icon: 'ti ti-trash-x', command: confirmDelete });
            } else {
                items.push({ key: 'delete', label: $t('common.delete', 'Delete'), icon: 'ti ti-trash', command: confirmDelete });
            }
        }
        return items;
    });
</script>

<template>
    <article class="kanban-card group/card flex flex-col gap-2 bg-surface-0 dark:bg-surface-900 rounded shadow-sm p-3 border select-none"
             :class="{
                 'border-surface-200 dark:border-surface-700': !card.is_deleted,
                 'border-red-400 dark:border-red-700 border-dashed opacity-75': card.is_deleted,
                 'cursor-grab': !card.readonly,
                 'readonly': card.readonly,
             }"
             :data-card-key="card.key" :aria-label="card.name">
        <header class="flex items-start gap-2">
            <i :class="`${card.icon} mt-1`" :title="card.itemtype" aria-hidden="true"></i>
            <button type="button" class="kanban-card-title grow text-start font-semibold hover:underline focus-visible:underline cursor-pointer wrap-anywhere"
                    :class="{ 'line-through': card.is_deleted }"
                    @click="emit('open', card)">
                {{ card.name }}
            </button>
            <i v-if="card.meta.is_milestone" class="ti ti-directions-filled mt-1" :title="$t('kanban.card.milestone', 'Milestone')"
               :aria-label="$t('kanban.card.milestone', 'Milestone')"></i>
            <Button v-if="menu_items.length" size="small" severity="secondary" variant="text" icon="ti ti-dots-vertical"
                    class="-my-1 shrink-0" :aria-label="$t('kanban.card.actions', 'Item actions')" aria-haspopup="true"
                    @click="menu_el?.toggle($event)"></Button>
            <TieredMenu v-if="menu_items.length" ref="menu" :model="menu_items" popup>
                <template #item="{ item, props: item_props, hasSubmenu }">
                    <RouterLink v-if="item.route" :to="item.route" custom v-slot="{ href, navigate }">
                        <a :href="href" v-bind="item_props.action" @click="navigate">
                            <i :class="item.icon" aria-hidden="true"></i>
                            <span>{{ item.label }}</span>
                        </a>
                    </RouterLink>
                    <a v-else v-bind="item_props.action">
                        <i v-if="item.icon" :class="item.icon" aria-hidden="true"></i>
                        <span>{{ item.label }}</span>
                        <i v-if="hasSubmenu" class="ti ti-chevron-right ms-auto" aria-hidden="true"></i>
                    </a>
                </template>
            </TieredMenu>
        </header>

        <slot name="card-content" :card="card">
            <RouterLink v-if="show_parent && card.parent" :to="`/tools/project/${card.parent.id}`" class="text-sm text-muted-color hover:underline">
                {{ card.itemtype === 'Project'
                    ? $t('kanban.card.subproject_of', { name: card.parent.name }, 'Subproject of {name}')
                    : $t('kanban.card.subtask_of', { name: card.parent.name }, 'Subtask of {name}') }}
            </RouterLink>
            <div v-if="card.meta.type_name" class="text-sm text-muted-color">{{ card.meta.type_name }}</div>
            <div v-if="card.meta.tasks_total" class="text-sm">
                {{ $t('kanban.card.tasks_complete', { done: card.meta.tasks_done ?? 0, total: card.meta.tasks_total }, '{done} / {total} tasks complete') }}
            </div>
            <ProgressBar v-if="card.meta.percent_done !== undefined && card.meta.percent_done !== null" :value="card.meta.percent_done"
                         class="h-4! text-xs" :aria-label="$t('kanban.card.percent_done', 'Percent done')"></ProgressBar>
        </slot>

        <footer v-if="card.team.length || card.meta.due_date" class="flex items-center justify-between gap-2">
            <span v-if="card.meta.due_date" class="text-sm text-muted-color" :title="$t('kanban.card.planned_end_date', 'Planned end date')">
                <i class="ti ti-calendar" aria-hidden="true"></i>
                <span class="sr-only">{{ $t('kanban.card.planned_end_date', 'Planned end date') }}</span>
                {{ formatDate(card.meta.due_date) }}
            </span>
            <span v-else></span>
            <AvatarGroup v-if="card.team.length">
                <ActorAvatar v-for="member in shown_team" :key="`${member.itemtype}-${member.items_id}`"
                             :actor_type="member.itemtype" :actor_data="getActorData(member.itemtype, member.items_id)"
                             size="normal" shape="circle"></ActorAvatar>
                <template v-if="overflow_team.length">
                    <Avatar :label="`+${overflow_team.length}`" shape="circle" size="normal" class="cursor-pointer" role="button" tabindex="0"
                            :aria-label="$t('kanban.card.more_team_members', { count: overflow_team.length }, 'Show {count} more team members')"
                            @click="team_overflow_el?.toggle($event)" @keydown.enter="team_overflow_el?.toggle($event)"></Avatar>
                    <Popover ref="team_overflow">
                        <ul class="flex flex-col gap-2">
                            <li v-for="member in overflow_team" :key="`${member.itemtype}-${member.items_id}`" class="flex items-center gap-2">
                                <ActorAvatar :actor_type="member.itemtype" :actor_data="getActorData(member.itemtype, member.items_id)" size="normal" shape="circle"></ActorAvatar>
                                <span>{{ kanban.getMemberName(member) }}</span>
                            </li>
                        </ul>
                    </Popover>
                </template>
            </AvatarGroup>
        </footer>
    </article>
</template>
