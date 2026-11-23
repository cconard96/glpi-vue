import type {
    KanbanAdapter, KanbanBoard, KanbanCard, KanbanColumnDef, KanbanCreatableItemtype, KanbanRights, KanbanTeamItemtype, KanbanTeamMember,
} from "@/common/kanban/kanban";
import { useApi } from "@/common/api/useApi";
import { BaseRights, useSessionStore } from "@/common/useSessionStore";
import { cardKey } from "@/common/kanban/useKanban";
import { useI18n } from "vue-i18n";

/** ProjectTask specific right allowing to update tasks the user is a team member of */
const PROJECTTASK_UPDATEMY = 1024;

interface TeamData {
    id: number;
    itemtype: KanbanTeamItemtype;
    items_id: number;
}

interface ProjectData {
    id: number;
    name: string;
    content?: string | null;
    status?: { id: number | null } | null;
    parent?: { id: number | null; name?: string | null } | null;
    user?: { id: number | null } | null;
    group?: { id: number | null } | null;
    entity?: { id: number | null } | null;
    is_recursive?: boolean;
    plan_end_date?: string | null;
    percent_done?: number | null;
    is_deleted?: boolean;
    team?: TeamData[];
}

interface ProjectTaskData {
    id: number;
    name: string;
    content?: string | null;
    status?: { id: number | null } | null;
    project?: { id: number | null; name?: string | null } | null;
    parent_task?: { id: number | null } | null;
    type?: { id: number | null; name?: string | null } | null;
    plan_end_date?: string | null;
    percent_done?: number | null;
    is_milestone?: boolean;
    is_deleted?: boolean;
    team?: TeamData[];
}

const TEAM_FIELDS = 'team { id itemtype items_id }';
const PROJECT_FIELDS = `id name content status { id } parent { id name } user { id } group { id } entity { id } is_recursive plan_end_date percent_done is_deleted ${TEAM_FIELDS}`;
const TASK_FIELDS = `id name content status { id } project { id name } parent_task { id } type { id name } plan_end_date percent_done is_milestone is_deleted ${TEAM_FIELDS}`;

/** Convert an HTML string into plain text for previews */
function htmlToText(html: string | null | undefined): string {
    if (!html) {
        return '';
    }
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function toIdList(ids: Iterable<number>): string {
    return [...ids].map(id => Number(id)).filter(id => Number.isInteger(id)).join(',');
}

function countSteps(steps: ProjectTaskData[]): { tasks_done: number; tasks_total: number } {
    return {
        tasks_done: steps.filter(s => Number(s.percent_done) === 100).length,
        tasks_total: steps.length,
    };
}

export function useProjectKanbanAdapter(): KanbanAdapter {
    const { doGraphQLRequest, doApiRequest } = useApi();
    const session = useSessionStore();
    const { t: $t } = useI18n();

    /** Cache of the board project's data needed for rights and new item defaults */
    let board_project: ProjectData | null = null;


    function isManager(project: ProjectData | null): boolean {
        if (!project) {
            return false;
        }
        const user_id = project.user?.id;
        const group_id = project.group?.id;
        return (!!user_id && user_id === session.user_id) || (!!group_id && (session.groups ?? []).includes(group_id));
    }

    const canUpdateProject = () => session.hasRight('project', BaseRights.UPDATE);
    const canUpdateTask = () => session.hasRight('projecttask', BaseRights.UPDATE) || session.hasRight('projecttask', PROJECTTASK_UPDATEMY);

    async function fetchFinishedStateIds(): Promise<Set<number>> {
        const response = await doGraphQLRequest<{ ProjectState: Array<{ id: number; is_finished: boolean }> }>(
            `query { ProjectState { id is_finished } }`, {}, 'cache-first'
        );
        return new Set(response.data.ProjectState.filter(s => s.is_finished).map(s => s.id));
    }

    function teamFromData(team: TeamData[] | undefined): KanbanTeamMember[] {
        return (team ?? []).map(m => ({
            id: m.id,
            itemtype: m.itemtype,
            items_id: Number(m.items_id),
            role: $t('kanban.team.member', 'Member'),
        }));
    }

    function projectCard(p: ProjectData, steps: ProjectTaskData[], parent: ProjectData | null): KanbanCard {
        return {
            key: cardKey('Project', p.id),
            itemtype: 'Project',
            id: p.id,
            column: p.status?.id ?? 0,
            name: p.name,
            icon: 'ti ti-layout-kanban',
            content: htmlToText(p.content),
            is_deleted: !!p.is_deleted,
            readonly: !canUpdateProject(),
            parent: parent ? { itemtype: 'Project', id: parent.id, name: parent.name } : null,
            team: teamFromData(p.team),
            meta: {
                percent_done: p.percent_done ?? 0,
                due_date: p.plan_end_date ?? null,
                ...countSteps(steps),
            },
        };
    }

    function taskCard(t: ProjectTaskData, steps: ProjectTaskData[], show_parent: boolean): KanbanCard {
        return {
            key: cardKey('ProjectTask', t.id),
            itemtype: 'ProjectTask',
            id: t.id,
            column: t.status?.id ?? 0,
            name: t.name,
            icon: 'ti ti-list-check',
            content: htmlToText(t.content),
            is_deleted: !!t.is_deleted,
            readonly: !canUpdateTask(),
            parent: show_parent && t.project?.id ? { itemtype: 'Project', id: t.project.id, name: t.project.name ?? '' } : null,
            team: teamFromData(t.team),
            meta: {
                is_milestone: !!t.is_milestone,
                percent_done: t.percent_done ?? 0,
                due_date: t.plan_end_date ?? null,
                type_name: t.type?.name ?? null,
                ...countSteps(steps),
            },
        };
    }

    async function fetchBoardProject(board_id: number): Promise<ProjectData | null> {
        if (board_id <= 0) {
            board_project = null;
            return null;
        }
        const response = await doGraphQLRequest<{ Project: ProjectData[] }>(
            `query { Project(filter: "id==${Number(board_id)}") { ${PROJECT_FIELDS} } }`
        );
        board_project = response.data.Project[0] ?? null;
        return board_project;
    }

    const adapter: KanbanAdapter = {
        boardItemtype: 'Project',
        teamItemtypes: ['User', 'Group', 'Supplier', 'Contact'],

        async fetchBoards(current_board_id: number): Promise<KanbanBoard[]> {
            console.log('fetchBoards');
            const [response, finished] = await Promise.all([
                doGraphQLRequest<{ Project: Array<{ id: number; name: string; status?: { id: number | null } | null }> }>(
                    `query { Project(filter: "is_deleted==false;is_template==false") { id name status { id } } }`
                ),
                fetchFinishedStateIds(),
            ]);
            const boards: KanbanBoard[] = [{ id: 0, name: $t('kanban.global.name', 'Global') }];
            response.data.Project
                .filter(p => p.id === current_board_id || !finished.has(p.status?.id ?? 0))
                .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
                .forEach(p => boards.push({ id: p.id, name: p.name }));
            return boards;
        },

        async fetchColumns(): Promise<KanbanColumnDef[]> {
            console.log('fetchColumns');
            const response = await doGraphQLRequest<{ ProjectState: Array<{ id: number; name: string; color: string | null }> }>(
                `query { ProjectState { id name color is_finished } }`
            );

            return [
                { id: 0, label: $t('kanban.project.nostatus', 'No status'), color: null, protected: true },
                ...response.data.ProjectState.map(s => ({ id: s.id, label: s.name, color: s.color || null })),
            ];
        },

        async fetchCards(board_id: number): Promise<KanbanCard[]> {
            const is_global = board_id <= 0;
            const project_filter = is_global ? 'is_template==false' : `is_template==false;parent.id==${Number(board_id)}`;
            const [projects_response, finished] = await Promise.all([
                doGraphQLRequest<{ Project: ProjectData[] }>(`query { Project(filter: "${project_filter}") { ${PROJECT_FIELDS} } }`),
                is_global ? fetchFinishedStateIds() : Promise.resolve(new Set<number>()),
            ]);
            const projects = projects_response.data.Project;
            const projects_by_id = new Map(projects.map(p => [p.id, p]));

            // Tasks are needed for the board project (cards) and for sub-projects (progress steps)
            let tasks: ProjectTaskData[];
            if (is_global) {
                // Fetching all tasks is cheaper than a very long ID list. Template projects' tasks are filtered below.
                const response = await doGraphQLRequest<{ ProjectTask: ProjectTaskData[] }>(`query { ProjectTask { ${TASK_FIELDS} } }`);
                tasks = response.data.ProjectTask.filter(t => t.project?.id && projects_by_id.has(t.project.id));
            } else {
                const ids = toIdList([board_id, ...projects.map(p => p.id)]);
                const response = await doGraphQLRequest<{ ProjectTask: ProjectTaskData[] }>(
                    `query { ProjectTask(filter: "project.id=in=(${ids})") { ${TASK_FIELDS} } }`
                );
                tasks = response.data.ProjectTask;
            }

            const tasks_by_project = new Map<number, ProjectTaskData[]>();
            const tasks_by_parent_task = new Map<number, ProjectTaskData[]>();
            for (const task of tasks) {
                const project_id = task.project?.id ?? 0;
                if (!tasks_by_project.has(project_id)) {
                    tasks_by_project.set(project_id, []);
                }
                tasks_by_project.get(project_id)!.push(task);
                const parent_task_id = task.parent_task?.id ?? 0;
                if (parent_task_id > 0) {
                    if (!tasks_by_parent_task.has(parent_task_id)) {
                        tasks_by_parent_task.set(parent_task_id, []);
                    }
                    tasks_by_parent_task.get(parent_task_id)!.push(task);
                }
            }

            const cards: KanbanCard[] = projects.map(p => {
                const parent = is_global && p.parent?.id ? projects_by_id.get(p.parent.id) ?? null : null;
                return projectCard(p, tasks_by_project.get(p.id) ?? [], parent);
            });

            const card_tasks = is_global
                // Tasks of finished projects are not shown in the global view
                ? tasks.filter(t => !finished.has(projects_by_id.get(t.project!.id!)?.status?.id ?? 0))
                : (tasks_by_project.get(board_id) ?? []);
            cards.push(...card_tasks.map(t => taskCard(t, tasks_by_parent_task.get(t.id) ?? [], is_global)));
            return cards;
        },

        async getRights(board_id: number): Promise<KanbanRights> {
            const project = await fetchBoardProject(board_id);
            const can_modify_view = board_id <= 0 || isManager(project);
            return {
                canModifyView: can_modify_view,
                canOrderCard: can_modify_view,
                canCreateItem: session.hasRight('project', BaseRights.CREATE) || session.hasRight('project', BaseRights.UPDATE),
                // There is no HL API endpoint to create project states yet
                canCreateColumn: false,
                canDeleteItem: session.hasRight('project', BaseRights.DELETE) || session.hasRight('projecttask', BaseRights.DELETE),
                createLimitedColumns: can_modify_view ? null : [0],
            };
        },

        async updateCardColumn(card: KanbanCard, column: number): Promise<void> {
            const endpoint = card.itemtype === 'Project' ? `Project/${card.id}` : `Project/Task/${card.id}`;
            await doApiRequest(endpoint, { method: 'PATCH', data: { status: column } });
        },

        creatableItemtypes(board_id: number): KanbanCreatableItemtype[] {
            const result: KanbanCreatableItemtype[] = [];
            if (session.hasRight('project', BaseRights.CREATE)) {
                result.push({
                    itemtype: 'Project',
                    label: $t('kanban.project.project', 'Project'),
                    icon: 'ti ti-layout-kanban',
                    fields: [
                        { name: 'name', label: $t('common.name', 'Name'), type: 'text', required: true },
                        { name: 'content', label: $t('common.content', 'Content'), type: 'textarea' },
                    ],
                    allowBulk: true,
                });
            }
            // Same as ProjectTask::canCreate()
            if (session.hasRight('project', BaseRights.UPDATE)) {
                result.push({
                    itemtype: 'ProjectTask',
                    label: $t('kanban.project.task', 'Project task'),
                    icon: 'ti ti-list-check',
                    fields: [
                        ...(board_id <= 0 ? [{ name: 'project', label: $t('kanban.project.project', 'Project'), type: 'board' as const, required: true }] : []),
                        { name: 'name', label: $t('common.name', 'Name'), type: 'text', required: true },
                        { name: 'content', label: $t('common.content', 'Content'), type: 'textarea' },
                    ],
                    allowBulk: true,
                });
            }
            return result;
        },

        async createItem(itemtype: string, input: Record<string, any>): Promise<void> {
            const entity = board_project?.entity?.id ?? session.active_entity?.id;
            const is_recursive = board_project?.is_recursive ?? false;
            const status = Number(input.column ?? 0);
            if (itemtype === 'Project') {
                await doApiRequest('Project', {
                    method: 'POST',
                    data: {
                        name: input.name,
                        content: input.content ?? '',
                        status,
                        parent: board_project?.id ?? 0,
                        user: session.user_id,
                        entity,
                        is_recursive,
                    },
                });
            } else if (itemtype === 'ProjectTask') {
                const project_id = Number(input.project ?? board_project?.id ?? 0);
                if (project_id <= 0) {
                    throw new Error('A project is required to create a task');
                }
                await doApiRequest('Project/Task', {
                    method: 'POST',
                    data: {
                        name: input.name,
                        content: input.content ?? '',
                        status,
                        project: project_id,
                        entity,
                        is_recursive,
                    },
                });
            } else {
                throw new Error(`Unsupported itemtype ${itemtype}`);
            }
        },

        async deleteItem(card: KanbanCard, force: boolean): Promise<void> {
            const endpoint = card.itemtype === 'Project' ? `Project/${card.id}` : `Project/Task/${card.id}`;
            await doApiRequest(endpoint, { method: 'DELETE', params: force ? { force: 1 } : {} });
        },

        async restoreItem(card: KanbanCard): Promise<void> {
            const endpoint = card.itemtype === 'Project' ? `Project/${card.id}` : `Project/Task/${card.id}`;
            await doApiRequest(endpoint, { method: 'PATCH', data: { is_deleted: false } });
        },

        async addTeamMember(card: KanbanCard, member: KanbanTeamMember): Promise<void> {
            const endpoint = card.itemtype === 'Project' ? `Project/${card.id}/TeamMember` : `Project/Task/${card.id}/TeamMember`;
            await doApiRequest(endpoint, { method: 'POST', data: { itemtype: member.itemtype, items_id: member.items_id } });
        },

        async removeTeamMember(card: KanbanCard, member: KanbanTeamMember): Promise<void> {
            if (!member.id) {
                throw new Error('Team member relation ID is required');
            }
            const endpoint = card.itemtype === 'Project' ? `Project/${card.id}/TeamMember` : `Project/Task/${card.id}/TeamMember`;
            await doApiRequest(`${endpoint}/${member.id}`, { method: 'DELETE' });
        },

        filterTags: {
            title: { description: $t('kanban.filter.title', 'Filter items by their title'), supported_prefixes: ['!', '#'] },
            type: {
                description: $t('kanban.filter.type', 'Filter items by their type'),
                supported_prefixes: ['!', '#'],
                autocomplete_values: ['Project', 'ProjectTask'],
            },
            milestone: {
                description: $t('kanban.filter.milestone', 'Filter items by their milestone status'),
                supported_prefixes: ['!'],
                autocomplete_values: ['true', 'false'],
            },
            content: { description: $t('kanban.filter.content', 'Filter items by their content'), supported_prefixes: ['!', '#'] },
            deleted: {
                description: $t('kanban.filter.deleted', 'Filter items by their deletion status'),
                supported_prefixes: ['!'],
                autocomplete_values: ['true', 'false'],
            },
            team: { description: $t('kanban.filter.team', 'Filter items by their team members'), supported_prefixes: ['!'] },
            user: { description: $t('kanban.filter.user', 'Filter items by user team members'), supported_prefixes: ['!'] },
            group: { description: $t('kanban.filter.group', 'Filter items by group team members'), supported_prefixes: ['!'] },
            supplier: { description: $t('kanban.filter.supplier', 'Filter items by supplier team members'), supported_prefixes: ['!'] },
            contact: { description: $t('kanban.filter.contact', 'Filter items by contact team members'), supported_prefixes: ['!'] },
        },

        getCardRoute(card: KanbanCard): string | null {
            if (card.itemtype === 'Project') {
                return `/tools/project/${card.id}`;
            }
            if (card.parent?.itemtype === 'Project') {
                return `/tools/project/${card.parent.id}`;
            }
            if (board_project) {
                return `/tools/project/${board_project.id}`;
            }
            return null;
        },
    };
    return adapter;
}
