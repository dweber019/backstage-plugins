# Simple Icons Plugin

Welcome to the [Simple Icons](https://simpleicons.org/) plugin!

This plugin will add more icons to your app, which can be used in links for example.

![color](https://raw.githubusercontent.com/dweber019/backstage-plugins/main/plugins/simple-icons/docs/color.png)
![no color light](https://raw.githubusercontent.com/dweber019/backstage-plugins/main/plugins/simple-icons/docs/no-color-light.png)
![no color dark](https://raw.githubusercontent.com/dweber019/backstage-plugins/main/plugins/simple-icons/docs/no-color-dark.png)

## Usage

After setup you can use icons like this

```yaml
---
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: simple-icons
  links:
    - title: Prometheus
      url: https://google.ch
      icon: prometheus
    - title: Grafana
      url: https://google.ch
      icon: grafana
    - title: Google BigQuery
      url: https://google.ch
      icon: googlebigquery
    - title: 1.1.1.1
      url: https://google.ch
      icon: 1dot1dot1dot1
    - title: Github copilot
      url: https://google.ch
      icon: githubcopilot
    - title: Backstage
      url: https://google.ch
      icon: backstage
```

The name of the icon can be copied from https://simpleicons.org/ by hovering over the icon name and use the copy function.

## Setup

1. Install this plugin:

```bash
# From your Backstage root directory
yarn --cwd packages/app add @dweber019/backstage-plugin-simple-icons
```

2. Add the icons to your app

```tsx
// packages/app/src/App.tsx

import { simpleIconsColor } from '@dweber019/backstage-plugin-simple-icons';

const app = createApp({
  apis,
  bindRoutes({ bind }) {
    ...
  },
  ...
  icons: simpleIconsColor,
});
```

> You can use `import { simpleIcons } from '@dweber019/backstage-plugin-simple-icons';` for black and white icons.

If you want to provide just a subset of icons you can do so by using

```tsx
// packages/app/src/App.tsx

import { siNodedotjs } from 'simple-icons';
import { createIcon } from '@dweber019/backstage-plugin-simple-icons';

const app = createApp({
  apis,
  bindRoutes({ bind }) {
    ...
  },
  ...
  icons: {
    nodedotjs: createIcon(siNodedotjs),
  },
});
```

## Entity presentation API

This plugin also exports a implementation of the `EntityPresentationApi` to display the simple icons based on the
annotation `simpleicons.org/icon-slug`.

![entity presentation api](https://raw.githubusercontent.com/dweber019/backstage-plugins/main/plugins/simple-icons/docs/entitiy-presentation-api.png)

For this to work add the following line of code

```ts
// packages/app/src/apis.ts

import { catalogApiRef, entityPresentationApiRef } from '@backstage/plugin-catalog-react';
import { SimpleIconsEntityPresentationApi } from '@dweber019/backstage-plugin-simple-icons';

export const apis: AnyApiFactory[] = [
  ...
  createApiFactory({
    api: entityPresentationApiRef,
    deps: { catalogApi: catalogApiRef },
    factory: ({ catalogApi }) => {
      return SimpleIconsEntityPresentationApi.create({ catalogApi });
    },
  }),
];
```

## Licence

Please read the [legal disclaimer](https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md) of [Simple Icons](https://simpleicons.org/).

## Credits

Thanks [@mikevader](https://github.com/mikevader) for the inspriration.
