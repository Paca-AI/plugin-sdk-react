/**
 * Shared types used between the plugin host and plugin micro-frontends.
 * These match the JSON shapes returned by the paca.* host functions and the
 * REST API endpoints exposed to plugins.
 */

// ── Task ──────────────────────────────────────────────────────────────────────

/** Lightweight task summary returned by the tasks_list host function. */
export interface TaskSummary {
	id: string;
	title: string;
	task_number: number;
	status_id: string | null;
	assignee_id: string | null;
}

/** Full task object returned by the task_get host function. */
export interface Task extends TaskSummary {
	project_id: string;
}

/** Filters that can be passed to PluginApiClient.listTasks(). */
export interface TaskFilters {
	status_ids?: string[];
	assignee_ids?: string[];
	sprint_id?: string;
	parent_task_id?: string;
	/** Cursor from a previous page's `next_cursor` (see listTasksPage). */
	cursor?: string;
	/** @deprecated Ignored: tasks page by cursor. Use `cursor` (see listTasksPage). */
	page?: number;
	page_size?: number;
}

/** One page of the tasks list, keyset-paginated by cursor. */
export interface TaskPage {
	items: TaskSummary[];
	page_size: number;
	/** Pass as `cursor` for the next page; null on the last page. */
	next_cursor: string | null;
	/** Tasks matching the filters across all pages (first page only). */
	total_count?: number;
}

// ── Project ───────────────────────────────────────────────────────────────────

/** Project summary returned by the project_get host function. */
export interface ProjectSummary {
	id: string;
	name: string;
	description: string;
	task_id_prefix: string;
}

// ── Members ───────────────────────────────────────────────────────────────────

/** A project member as returned by the members list. */
export interface ProjectMember {
	id: string;
	username: string;
	full_name: string;
	/** The roles the member holds in the project. */
	roles?: { id: string; name: string }[];
}

/** Filters for PluginApiClient.listMembers(). */
export interface ListMembersOptions {
	/** Words that must all appear in the member's username, name or handle. */
	search?: string;
	/** Only these members, by membership id or account id (at most 100). */
	ids?: string[];
	/** Cursor from a previous page's `next_cursor`. */
	cursor?: string;
	/** Page size, 1-100 (default 20). */
	pageSize?: number;
}

/** One page of the members list, keyset-paginated by cursor. */
export interface MemberPage {
	items: ProjectMember[];
	page_size: number;
	/** Pass as `cursor` for the next page; null on the last page. */
	next_cursor: string | null;
	/** Members matching the filters across all pages. */
	total_count: number;
}

/** Role-based permission flags available to plugin components. */
export interface ProjectPermissions {
	canManageProject: boolean;
	canManageMembers: boolean;
	canWriteTasks: boolean;
	canReadTasks: boolean;
}

/** Derive ProjectPermissions from a role name. */
export function permissionsFromRole(roleName: string): ProjectPermissions {
	const role = roleName.toUpperCase();
	return {
		canManageProject: role === "PROJECT_OWNER" || role === "PROJECT_MANAGER",
		canManageMembers: role === "PROJECT_OWNER" || role === "PROJECT_MANAGER",
		canWriteTasks:
			role === "PROJECT_OWNER" ||
			role === "PROJECT_MANAGER" ||
			role === "PROJECT_MEMBER",
		canReadTasks: true,
	};
}

// ── Plugin meta ───────────────────────────────────────────────────────────────

/** Metadata injected into every plugin component via PluginMeta prop. */
export interface PluginMeta {
	/** Reverse-DNS plugin identifier, e.g. "com.paca.checklist". */
	pluginId: string;
	/** Plugin display name. */
	displayName: string;
	/** Semver version string. */
	version: string;
}
