/**
 * PluginApiClient — scoped HTTP client for plugin micro-frontends.
 *
 * Plugins should never import axios or create their own fetch wrappers.
 * Instead, the host injects a pre-configured PluginApiClient via context so
 * all requests are automatically scoped to the current project and include
 * the authenticated session credentials.
 */

import type {
	ListMembersOptions,
	MemberPage,
	ProjectSummary,
	TaskPage,
	Task,
	TaskFilters,
	TaskSummary,
} from "./types";

// ── Response envelope ─────────────────────────────────────────────────────────

interface SuccessEnvelope<T> {
	success: true;
	data: T;
}

// ── Client ────────────────────────────────────────────────────────────────────

export interface PluginApiClientOptions {
	/** Base URL of the paca API, e.g. "https://app.paca.dev/api/v1". */
	baseUrl: string;
	/**
	 * Current project ID (injected by the host). Omit for admin/global-scope
	 * pages (e.g. components registered at the `admin.page` extension point)
	 * where there is no current project — `projectId` is then `""` and
	 * `listTasks`/`getTask`/`getProject`/`listMembers` must not be called.
	 */
	projectId?: string;
	/** Axios-compatible function for authenticated fetches (injected by host). */
	fetch: (url: string, init?: RequestInit) => Promise<Response>;
}

/**
 * PluginApiClient provides typed methods for common Paca API calls.
 * Plugin route calls are prefixed with `/plugins/{pluginId}/`.
 * Use the `projectId` property to include project context in paths when needed:
 *   `pluginGet(id, \`/projects/${api.projectId}/my-resource\`)`
 */
export class PluginApiClient {
	private readonly baseUrl: string;
	public readonly projectId: string;
	private readonly _fetch: PluginApiClientOptions["fetch"];

	constructor(opts: PluginApiClientOptions) {
		this.baseUrl = opts.baseUrl.replace(/\/$/, "");
		this.projectId = opts.projectId ?? "";
		this._fetch = opts.fetch;
	}

	// ── Core read-only helpers ──────────────────────────────────────────────

	/**
	 * The first page of the current project's tasks (up to 200 by default).
	 * A project with more matching tasks is truncated: use `listTasksPage` and
	 * follow `next_cursor` when every task matters.
	 */
	async listTasks(filters: TaskFilters = {}): Promise<TaskSummary[]> {
		return (await this.listTasksPage(filters)).items;
	}

	/**
	 * One page of the current project's tasks with optional filters. Pass the
	 * previous page's `next_cursor` as `filters.cursor` for the next page.
	 * Defaults to the host's max page size (200) when the caller doesn't
	 * specify one, since the host otherwise defaults to only 20.
	 */
	async listTasksPage(filters: TaskFilters = {}): Promise<TaskPage> {
		const params = new URLSearchParams();
		if (filters.cursor) params.set("cursor", filters.cursor);
		if (filters.status_ids?.length)
			params.set("status_ids", filters.status_ids.join(","));
		if (filters.assignee_ids?.length)
			params.set("assignee_ids", filters.assignee_ids.join(","));
		if (filters.sprint_id) params.set("sprint_id", filters.sprint_id);
		if (filters.parent_task_id)
			params.set("parent_task_id", filters.parent_task_id);
		params.set("page_size", String(filters.page_size ?? 200));

		const qs = params.toString();
		const url = `${this.baseUrl}/projects/${this.projectId}/tasks${qs ? `?${qs}` : ""}`;
		return this._get<TaskPage>(url);
	}

	/** Get a single task by ID. */
	async getTask(taskId: string): Promise<Task> {
		return this._get<Task>(
			`${this.baseUrl}/projects/${this.projectId}/tasks/${taskId}`,
		);
	}

	/** Get the current project summary. */
	async getProject(): Promise<ProjectSummary> {
		return this._get<ProjectSummary>(
			`${this.baseUrl}/projects/${this.projectId}`,
		);
	}

	/**
	 * One page of the current project's members (cursor-paginated). Pass
	 * `ids` to look up specific members, `search` to filter by name; follow
	 * `next_cursor` for further pages.
	 */
	async listMembers(opts: ListMembersOptions = {}): Promise<MemberPage> {
		const params = new URLSearchParams();
		if (opts.search) params.set("search", opts.search);
		if (opts.ids?.length) params.set("ids", opts.ids.join(","));
		if (opts.cursor) params.set("cursor", opts.cursor);
		if (opts.pageSize) params.set("page_size", String(opts.pageSize));
		const qs = params.toString();
		return this._get<MemberPage>(
			`${this.baseUrl}/projects/${this.projectId}/members${qs ? `?${qs}` : ""}`,
		);
	}

	// ── Plugin route helpers ────────────────────────────────────────────────

	/**
	 * Call a GET route registered by this plugin.
	 * The URL is built as `{baseUrl}/plugins/{pluginId}{path}`.
	 * For project-scoped routes, include the project prefix in `path`:
	 *   `pluginGet(id, \`/projects/${api.projectId}/resource\`)`
	 */
	async pluginGet<T>(pluginId: string, path: string): Promise<T> {
		return this._get<T>(this._pluginUrl(pluginId, path));
	}

	/**
	 * Call a POST route registered by this plugin.
	 */
	async pluginPost<T>(
		pluginId: string,
		path: string,
		body: unknown,
	): Promise<T> {
		return this._request<T>("POST", this._pluginUrl(pluginId, path), body);
	}

	/**
	 * Call a PATCH route registered by this plugin.
	 */
	async pluginPatch<T>(
		pluginId: string,
		path: string,
		body: unknown,
	): Promise<T> {
		return this._request<T>("PATCH", this._pluginUrl(pluginId, path), body);
	}

	/**
	 * Call a DELETE route registered by this plugin.
	 */
	async pluginDelete(pluginId: string, path: string): Promise<void> {
		await this._request<void>(
			"DELETE",
			this._pluginUrl(pluginId, path),
			undefined,
		);
	}

	// ── Internals ───────────────────────────────────────────────────────────

	private _pluginUrl(pluginId: string, path: string): string {
		const p = path.startsWith("/") ? path : `/${path}`;
		return `${this.baseUrl}/plugins/${pluginId}${p}`;
	}

	private async _get<T>(url: string): Promise<T> {
		return this._request<T>("GET", url, undefined);
	}

	private async _request<T>(
		method: string,
		url: string,
		body: unknown,
	): Promise<T> {
		const init: RequestInit = {
			method,
			headers: { "Content-Type": "application/json" },
		};
		if (body !== undefined) {
			init.body = JSON.stringify(body);
		}
		const res = await this._fetch(url, init);
		if (!res.ok) {
			const text = await res.text().catch(() => res.statusText);
			throw new Error(
				`[PluginApiClient] ${method} ${url} → ${res.status}: ${text}`,
			);
		}
		if (res.status === 204) return undefined as T;
		const json = (await res.json()) as SuccessEnvelope<T>;
		return json.data;
	}
}
