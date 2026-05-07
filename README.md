# @paca-ai/plugin-sdk-react — Frontend

TypeScript/React SDK for building Paca plugin micro-frontends.

## Installation

```bash
npm install @paca-ai/plugin-sdk-react
```

> `react`, `react-dom`, and `@tanstack/react-query` are peer dependencies and
> must already be installed in your plugin.

## Quick start

```tsx
import { usePlugin, usePluginQuery } from "@paca-ai/plugin-sdk-react";

export function ChecklistSection() {
  const { api, ui, meta } = usePlugin();

  const { data: items = [] } = usePluginQuery(
    meta.pluginId,
    ["items"],
    () => api.pluginGet(meta.pluginId, "/items"),
  );

  async function handleDelete(id: string) {
    const ok = await ui.confirm({ title: "Delete item?", variant: "destructive" });
    if (!ok) return;
    await api.pluginDelete(meta.pluginId, `/items/${id}`);
    ui.toast({ title: "Deleted", variant: "success" });
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          {item.title}
          <button onClick={() => handleDelete(item.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
```

## API reference

### `usePlugin()`
Returns `{ api, ui, meta }` from the nearest `<PluginProvider>`.

### `PluginApiClient`
Scoped HTTP client. Methods:
- `listTasks(filters?)` — list tasks in current project
- `getTask(taskId)` — fetch a single task
- `getProject()` — fetch current project summary
- `listMembers()` — list project members
- `pluginGet(pluginId, path)` — GET a plugin route
- `pluginPost(pluginId, path, body)` — POST to a plugin route
- `pluginPatch(pluginId, path, body)` — PATCH a plugin route
- `pluginDelete(pluginId, path)` — DELETE a plugin route

### `PluginUI`
Host-provided UI utilities available via `ui`:
- `ui.toast(opts)` — show a toast notification
- `ui.confirm(opts)` — show a confirmation dialog (returns `Promise<boolean>`)
- `ui.navigate(path)` — navigate to a host-app path

### `usePluginQuery(pluginId, queryKey, queryFn, options?)`
Wrapper around `useQuery` that namespaces cache keys under `["plugin", pluginId, ...]`.

### Extension point prop interfaces
Import the prop interface matching your registered extension point:
- `TaskDetailSectionProps` — `task.detail.section`
- `SidebarProjectSectionProps` — `sidebar.project.section`
- `SidebarGeneralSectionProps` — `sidebar.general.section`
- `ProjectSettingsTabProps` — `project.settings.tab`
- `ViewExtensionProps` — `view`
