# Tips Plugin

Welcome to the Tips plugin!

This plugin will show tips for entities. You can even extend the plugin with your own tips.

![Closed state](https://raw.githubusercontent.com/dweber019/backstage-plugins/main/plugins/tips/docs/closed-state.png)
![Open state](https://raw.githubusercontent.com/dweber019/backstage-plugins/main/plugins/tips/docs/open-state.png)

## Setup

1. Install this plugin:

```bash
# From your Backstage root directory
yarn --cwd packages/app add @dweber019/backstage-plugin-tips
```

### Entity Pages

Add the `EntityTipsDialog` to the EntityPage

```tsx
// packages/app/src/components/catalog/EntityPage.tsx

import { EntityTipsDialog } from '@dweber019/backstage-plugin-tips';

const entityWarningContent = (
  <>
    <EntitySwitch>
      <EntitySwitch.Case if={isOrphan}>
        <Grid item xs={12}>
          <EntityOrphanWarning />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>

    <EntitySwitch>
      <EntitySwitch.Case if={hasRelationWarnings}>
        <Grid item xs={12}>
          <EntityRelationWarning />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>

    <EntitySwitch>
      <EntitySwitch.Case if={hasCatalogProcessingErrors}>
        <Grid item xs={12}>
          <EntityProcessingErrorsPanel />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>

    <EntityTipsDialog />
  </>
);
```

### Custom tips

You can add custom tips.

```tsx
// packages/app/src/apis.tsx

import { tipsConfigRef, defaultTips } from '@dweber019/backstage-plugin-tips';
import { YourTip } from '...';

// ...

export const apis: AnyApiFactory[] = [
  // ...
  createApiFactory({
    api: tipsConfigRef,
    deps: {},
    factory: () => {
      return {
        tips: [...defaultTips, YourTip],
      };
    },
  }),
];
```

A custom tip has to satisfy the following interface

```tsx
export interface Tip {
  content: string | React.ReactElement;
  title: string;
  activate: (options: { entity?: Entity }) => boolean;
}
```

The tip will be displayed on the entity page when `activate` evaluates to `true`.  
The `content` of type `string` will be rendered with the builtin Backstage `Markdown` component.

You can have a look at `plugins/tips/src/lib/defaults.tsx` for some inspiration.

## Local development

There is a local setup at `plugins/tips/dev` which can be started with `yarn --cwd plugins/tips start` from the root.
