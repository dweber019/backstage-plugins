# Tasks

Todo:

- My tasks
- Move done tasks to completed list
- Bulk create tasks
- Improve UI

Welcome to the Tasks plugin!

## Setup

### Backend

You need to setup the [Tasks backend plugin](../tasks-backend/README.md) before you move forward with any of the following steps if you haven't already.

### Frontend

To setup the Tasks Card frontend you'll need to do the following steps:

1. First we need to add the `@dweber019/backstage-plugin-tasks` package to your frontend app:

   ```sh
   # From your Backstage root directory
   yarn --cwd packages/app add @dweber019/backstage-plugin-tasks
   ```

2. Second we need to add the `EntityTasksCard` extension to the entity page in your app:

   ```tsx
   // In packages/app/src/components/catalog/EntityPage.tsx
   import { EntityTasksCard } from '@dweber019/backstage-plugin-tasks';

   // For example in the Overview section
   const serviceEntityPage = (
     ...
     <EntityLayout.Route
       path="/tasks"
       title="Tasks"
     >
       <EntityTasksCard />
     </EntityLayout.Route>
     ...
   ```

   or any other location you like to see tasks.

3. Additionally, add the `TaskPage` route

   ```tsx
   // In packages/app/src/App.tsx
   import { TasksPage } from '@dweber019/backstage-plugin-tasks';

   const routes = (
     <FlatRoutes>
       ...
       <Route path="/tasks" element={<TasksPage />} />
     </FlatRoutes>
   );
   ```

4. Then add a nice navigation entry

   ```tsx
   // In packages/app/src/components/Root/Root.tsx
   import PlaylistAddCheck from '@material-ui/icons/PlaylistAddCheck';

   <SidebarGroup label="Menu" icon={<MenuIcon />}>
     <SidebarScrollWrapper>
       ...
       <SidebarItem icon={PlaylistAddCheck} to="tasks" text="Tasks" />
     </SidebarScrollWrapper>
   </SidebarGroup>;
   ```
