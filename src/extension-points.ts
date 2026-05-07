/**
 * Extension point prop interfaces.
 *
 * Each extension point in the host application defines a specific set of props
 * that it passes to registered plugin components.  Plugin authors should type
 * their component with the matching interface.
 *
 * Extension point IDs mirror the values used in the host PluginRegistryContext:
 *   - sidebar.general.section
 *   - sidebar.project.section
 *   - task.detail.section
 *   - project.settings.tab
 *   - view
 */

import type { PluginApiClient } from "./api-client";
import type { PluginMeta } from "./types";
import type { PluginUI } from "./ui";

// ── Shared base ───────────────────────────────────────────────────────────────

/** Base props injected into every registered plugin component. */
export interface BaseExtensionProps {
	/** SDK API client scoped to the current project. */
	api: PluginApiClient;
	/** Host UI utilities (toast, confirm, navigate). */
	ui: PluginUI;
	/** Metadata about the plugin itself. */
	meta: PluginMeta;
}

// ── sidebar.general.section ───────────────────────────────────────────────────

/**
 * Props for components registered at `sidebar.general.section`.
 * Rendered in the top-level navigation sidebar outside any project context.
 */
export interface SidebarGeneralSectionProps extends BaseExtensionProps {
	/** Whether the sidebar is currently collapsed. */
	isCollapsed: boolean;
}

// ── sidebar.project.section ───────────────────────────────────────────────────

/**
 * Props for components registered at `sidebar.project.section`.
 * Rendered inside the per-project sidebar navigation area.
 */
export interface SidebarProjectSectionProps extends BaseExtensionProps {
	/** The currently active project ID. */
	projectId: string;
	/** Whether the sidebar is currently collapsed. */
	isCollapsed: boolean;
}

// ── task.detail.section ───────────────────────────────────────────────────────

/**
 * Props for components registered at `task.detail.section`.
 * Rendered inside the task detail panel after the core sections.
 */
export interface TaskDetailSectionProps extends BaseExtensionProps {
	/** The task being displayed. */
	taskId: string;
	/** The project the task belongs to. */
	projectId: string;
}

// ── project.settings.tab ─────────────────────────────────────────────────────

/**
 * Props for components registered at `project.settings.tab`.
 * Rendered as an additional tab on the project settings page.
 */
export interface ProjectSettingsTabProps extends BaseExtensionProps {
	/** The project whose settings are being edited. */
	projectId: string;
}

// ── view ──────────────────────────────────────────────────────────────────────

/**
 * Props for components registered at the `view` extension point.
 * Rendered as a custom view in the board/view picker area.
 */
export interface ViewExtensionProps extends BaseExtensionProps {
	/** The project for which the view is rendered. */
	projectId: string;
	/** The view configuration stored for this registration. */
	viewConfig?: Record<string, unknown>;
}

// ── Union helper ──────────────────────────────────────────────────────────────

/** Union of all extension point prop types. */
export type ExtensionPointProps =
	| SidebarGeneralSectionProps
	| SidebarProjectSectionProps
	| TaskDetailSectionProps
	| ProjectSettingsTabProps
	| ViewExtensionProps;
