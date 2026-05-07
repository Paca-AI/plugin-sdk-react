/**
 * PluginQueryClientProvider + usePluginQuery
 *
 * Plugins share the host application's React Query client so that cache
 * entries are deduplicated.  `PluginQueryClientProvider` re-uses the existing
 * client when running inside the host; when running in isolation (tests,
 * storybook) it creates a minimal local client.
 *
 * `usePluginQuery` is a thin wrapper around `useQuery` that automatically
 * prefixes query keys with the plugin id so cache entries are namespaced and
 * cannot collide with host or sibling plugin entries.
 */

import {
	QueryClient,
	QueryClientProvider,
	type UseQueryOptions,
	type UseQueryResult,
	useQuery,
} from "@tanstack/react-query";
import { createContext, type ReactNode, useContext, useMemo } from "react";

// ── Query client context ──────────────────────────────────────────────────────

const QueryClientCtx = createContext<QueryClient | null>(null);

/**
 * Re-uses the host's QueryClient if one is already present in the tree,
 * otherwise creates an isolated client.  Plugins should mount this at the
 * root of their component tree.
 */
export function PluginQueryClientProvider({
	children,
	queryClient,
}: {
	children: ReactNode;
	/** Pass the host QueryClient instance here if available. */
	queryClient?: QueryClient;
}) {
	const fallback = useMemo(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: { retry: 1, staleTime: 30_000 },
				},
			}),
		[],
	);

	const client = queryClient ?? fallback;

	return (
		<QueryClientCtx.Provider value={client}>
			<QueryClientProvider client={client}>{children}</QueryClientProvider>
		</QueryClientCtx.Provider>
	);
}

// ── Namespaced query hook ─────────────────────────────────────────────────────

/**
 * Like `useQuery` but automatically namespaces the query key under
 * `["plugin", pluginId, ...queryKey]` to avoid cache collisions.
 *
 * @example
 * ```tsx
 * const { api, meta } = usePlugin();
 * const { data } = usePluginQuery(meta.pluginId, ["items", taskId], () =>
 *   api.pluginGet(meta.pluginId, `/tasks/${taskId}/items`)
 * );
 * ```
 */
export function usePluginQuery<TData = unknown, TError = Error>(
	pluginId: string,
	queryKey: unknown[],
	queryFn: () => Promise<TData>,
	options?: Omit<
		UseQueryOptions<TData, TError, TData, unknown[]>,
		"queryKey" | "queryFn"
	>,
): UseQueryResult<TData, TError> {
	return useQuery<TData, TError, TData, unknown[]>({
		...options,
		queryKey: ["plugin", pluginId, ...queryKey],
		queryFn,
	});
}

/** Access the QueryClient from context (for manual invalidation). */
export function usePluginQueryClient(): QueryClient {
	const client = useContext(QueryClientCtx);
	if (!client)
		throw new Error(
			"usePluginQueryClient must be inside a <PluginQueryClientProvider>",
		);
	return client;
}
