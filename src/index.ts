/**
 * @paca-ai/plugin-sdk-react — public API
 *
 * Re-exports every symbol that plugin micro-frontends may import.
 * Only types and functions listed here are considered stable.
 */

export type { PluginApiClientOptions } from "./api-client";
// ── API Client ────────────────────────────────────────────────────────────────
export { PluginApiClient } from "./api-client";
// ── Extension point prop interfaces ───────────────────────────────────────────
export type {
	BaseExtensionProps,
	ExtensionPointProps,
	ProjectSettingsTabProps,
	SidebarGeneralSectionProps,
	SidebarProjectSectionProps,
	TaskDetailSectionProps,
	ViewExtensionProps,
} from "./extension-points";
export type { PluginContextValue, PluginProviderProps } from "./plugin-context";
// ── Plugin context ────────────────────────────────────────────────────────────
export { PluginProvider, usePlugin } from "./plugin-context";
// ── React Query helpers ───────────────────────────────────────────────────────
export {
	PluginQueryClientProvider,
	usePluginQuery,
	usePluginQueryClient,
} from "./query";
// ── Types ─────────────────────────────────────────────────────────────────────
export type {
	PluginMeta,
	ProjectMember,
	ProjectPermissions,
	ProjectSummary,
	Task,
	TaskFilters,
	TaskSummary,
} from "./types";
export { permissionsFromRole } from "./types";
// ── UI helpers ────────────────────────────────────────────────────────────────
export type { ConfirmOptions, PluginUI, ToastOptions } from "./ui";
export { NoopPluginUI } from "./ui";
