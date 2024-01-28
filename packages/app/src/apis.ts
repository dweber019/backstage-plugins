import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import {
  apiDocsConfigRef,
  defaultDefinitionWidgets,
} from '@backstage/plugin-api-docs';
import {
  apiDocsModuleWsdlApiRef,
  ApiDocsModuleWsdlClient,
  wsdlApiWidget,
} from '@dweber019/backstage-plugin-api-docs-module-wsdl';
import { ApiEntity } from '@backstage/catalog-model';

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  ScmAuth.createDefaultApiFactory(),

  // Custom

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
