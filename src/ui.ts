/**
 * PluginUI — Host-provided UI utilities injected into plugin components.
 *
 * Plugins must not import toast or modal libraries directly; instead they
 * receive a PluginUI instance through the PluginContext so the host controls
 * the look and feel of all feedback elements.
 */

export interface ToastOptions {
	/** Toast title. */
	title: string;
	/** Optional description text below the title. */
	description?: string;
	/** Variant controlling the accent colour. Defaults to "default". */
	variant?: "default" | "destructive" | "success";
	/** Duration in milliseconds. Defaults to 4000. */
	duration?: number;
}

export interface ConfirmOptions {
	/** Dialog title. */
	title: string;
	/** Descriptive message to show inside the dialog. */
	description?: string;
	/** Label for the confirm button. Defaults to "Confirm". */
	confirmLabel?: string;
	/** Label for the cancel button. Defaults to "Cancel". */
	cancelLabel?: string;
	/** Variant for the confirm button. Defaults to "default". */
	variant?: "default" | "destructive";
}

/**
 * PluginUI exposes host-level UI interactions to plugin components.
 * An instance is injected by the host via PluginContext.
 */
export interface PluginUI {
	/**
	 * Display a toast notification.
	 * @example sdk.ui.toast({ title: "Saved", variant: "success" });
	 */
	toast(opts: ToastOptions): void;

	/**
	 * Open a confirmation dialog and return true when the user confirms.
	 * Returns false on cancel or dismissal.
	 * @example const ok = await sdk.ui.confirm({ title: "Delete item?", variant: "destructive" });
	 */
	confirm(opts: ConfirmOptions): Promise<boolean>;

	/**
	 * Navigate to a path within the host application using the host router.
	 * Paths are relative to the app root, e.g. "/projects/abc/tasks/123".
	 */
	navigate(path: string): void;
}

/**
 * NoopPluginUI — a silent no-op implementation used as the default context
 * value and in tests where the host UI is not available.
 */
export const NoopPluginUI: PluginUI = {
	toast: () => {
		/* no-op */
	},
	confirm: () => Promise.resolve(false),
	navigate: () => {
		/* no-op */
	},
};
