# Kong gateway

Welcome to the missing entity plugin!

This plugin will show a alert if related entities from relations are missing.

![warning](https://raw.githubusercontent.com/dweber019/backstage-plugins/main/plugins/missing-entity/docs/warning.png)

This will be done on demand, when visiting an entity page to have the most up-to-date information.
Additionally, the data will be generated in the background for alle entities in the catalog.

You can even check the catalog over a page

![page](https://raw.githubusercontent.com/dweber019/backstage-plugins/main/plugins/missing-entity/docs/page.png)

## Setup

### Backend

You need to setup the [backend plugin](../missing-entity-backend/README.md) before you move forward with any of the following steps if you haven't already.

### Frontend

To setup the alert frontend you'll need to do the following steps:

1. First we need to add the `@dweber019/backstage-plugin-missing-entity` package to your frontend app:

   ```sh
   # From your Backstage root directory
   yarn --cwd packages/app add @dweber019/backstage-plugin-missing-entity
   ```

2. Second we need to add the `MissingEntityWarning` to the entity page in your app:

   ```tsx
   // In packages/app/src/components/catalog/EntityPage.tsx
   import {
     MissingEntityWarning,
     hasEntityMissingWarnings,
   } from '@dweber019/backstage-plugin-missing-entity';

   const entityWarningContent = (
      <>
        // ...
        <EntitySwitch>
          <EntitySwitch.Case if={hasEntityMissingWarnings}>
            <Grid item xs={12}>
              <MissingEntityWarning />
            </Grid>
          </EntitySwitch.Case>
        </EntitySwitch>
        // ...
      </>
   );
   ```

3. Remove the built-in entity waring alert named `EntityRelationWarning` from `EntityPage.tsx`.

4. Add the page route

   ```tsx
   // In packages/app/src/App.tsx
   import { MissingEntityPage } from '@dweber019/backstage-plugin-missing-entity';

   const routes = (
     <FlatRoutes>
       // ...
       <Route path="/missing-entity" element={<MissingEntityPage />} />
     </FlatRoutes>
   );
   ```
    
5. Add a navigation menu

   ```tsx
   // In packages/app/src/components/Root/Root.tsx
   import LinkOffIcon from '@material-ui/icons/LinkOff';

     <SidebarScrollWrapper>
       <SidebarItem icon={LinkOffIcon} to="missing-entity" text="Missing entity" />
     </SidebarScrollWrapper>
   ```

## Notifications

You can install the notification system of Backstage by using this [tutorial](https://backstage.io/docs/notifications/).
If an entity has an error, the owner, group members or user is used as recipients.

# Icon
Thanks for <a href="https://www.flaticon.com/free-icons/broken-link" title="broken link icons">Broken link icons created by Freepik - Flaticon</a>
