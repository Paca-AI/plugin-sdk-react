/**
 * PluginContext — React context that provides SDK utilities to plugin
 * components.
 *
 * The host application wraps each remote component with a PluginProvider so
 * that sdk.api, sdk.ui, and sdk.meta are available anywhere in the plugin
 * component tree.
 *
 * Plugin components should call `usePlugin()` to access the SDK, rather than
 * accepting props directly, so the interface remains stable even as the host
 * evolves.
 */

import { createContext, type ReactNode, useContext } from "react";
import type { PluginApiClient } from "./api-client";
import type { PluginMeta } from "./types";
import type { PluginUI } from "./ui";
import { NoopPluginUI } from "./ui";

// ── Context value shape ───────────────────────────────────────────────────────

export interface PluginContextValue {
	/** HTTP client scoped to the current project and authenticated session. */
	api: PluginApiClient;
	/** Host UI utilities: toast, confirm, navigate. */
	ui: PluginUI;
	/** Metadata about the plugin itself. */
	meta: PluginMeta;
}

// ── Context ───────────────────────────────────────────────────────────────────

// biome-ignore lint/style/noNonNullAssertion: intentionally undefined until provided
const PluginContext = createContext<PluginContextValue>(null!);

// ── Provider ──────────────────────────────────────────────────────────────────

export interface PluginProviderProps {
	api: PluginApiClient;
	ui?: PluginUI;
	meta: PluginMeta;
	children: ReactNode;
}

/**
 * Wrap your plugin component tree with `<PluginProvider>` to make the SDK
 * context available to all descendant components.
 *
 * The host application does this automatically for registered extension point
 * components; plugin authors only need to add a Provider when writing tests or
 * standalone stories.
 */
export function PluginProvider({
	api,
	ui = NoopPluginUI,
	meta,
	children,
}: PluginProviderProps) {
	return (
		<PluginContext.Provider value={{ api, ui, meta }}>
			{children}
		</PluginContext.Provider>
	);
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Access the plugin SDK from any component inside a `<PluginProvider>`.
 *
 * @example
 * ```tsx
 * function MySection() {
 *   const { api, ui, meta } = usePlugin();
 *   ...
 * }
 * ```
 */
export function usePlugin(): PluginContextValue {
	const ctx = useContext(PluginContext);
	if (!ctx) {
		throw new Error("usePlugin must be used inside a <PluginProvider>");
	}
	return ctx;
}
