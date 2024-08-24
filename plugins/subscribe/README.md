# @dweber019/backstage-plugin-api-docs-module-wsdl

Frontend for the `@dweber019/backstage-plugin-api-docs-module-wsdl-backend` backend plugin.  
You need to install the backend plugin too.

## Setup

```
yarn add --cwd packages/app @dweber019/backstage-plugin-api-docs-module-wsdl
```

### Add the wsdlDocsApiWidget to your apis

Add the widget to your `apiDocsConfigRef`.

```ts
// packages/app/apis.ts

import {
  apiDocsModuleWsdlApiRef,
  ApiDocsModuleWsdlClient,
  wsdlApiWidget,
} from '@dweber019/backstage-plugin-api-docs-module-wsdl';

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: apiDocsModuleWsdlApiRef,
    deps: {
      identityApi: identityApiRef,
      discoveryApi: discoveryApiRef,
    },
    factory: ({ identityApi, discoveryApi }) =>
      new ApiDocsModuleWsdlClient({ identityApi, discoveryApi }),
  }),
  createApiFactory({
    api: apiDocsConfigRef,
    deps: {},
    factory: () => {
      // load the default widgets
      const definitionWidgets = defaultDefinitionWidgets();
      // add the wsdl-docs api widget to the definition widgets
      definitionWidgets.push(wsdlApiWidget);
      return {
        getApiDefinitionWidget: (apiEntity: ApiEntity) => {
          // find the widget for the type of api entity
          return definitionWidgets.find(d => d.type === apiEntity.spec.type);
        },
      };
    },
  }),
];
```

### Set the type in your api entities

This widget will render the generated `wsdl` descriptors with the provided `xslt` transformation.

```yaml
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: hello-world
  description: Hello World example for WSDL
spec:
  type: wsdl
  lifecycle: deprecated
  owner: foo
  definition:
    $text: http://www.dneonline.com/calculator.asmx?wsdl
```

You can find more examples in `./dev`.

## Local development

There is a local setup at `plugins/api-docs-module-wsdl/dev` which can be started with `yarn --cwd plugins/api-docs-module-wsdl start` from the root.

> Don't forget the local development backend as well.
