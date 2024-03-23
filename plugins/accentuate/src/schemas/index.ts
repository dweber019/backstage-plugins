import * as componentSchema from './Component.v1alpha1.schema.json';
import * as apiSchema from './API.v1alpha1.schema.json';
import * as domainSchema from './Domain.v1alpha1.schema.json';
import * as groupSchema from './Group.v1alpha1.schema.json';
import * as resourceSchema from './Resource.v1alpha1.schema.json';
import * as systemSchema from './System.v1alpha1.schema.json';
import * as userSchema from './User.v1alpha1.schema.json';
import { JsonSchema } from '../api';
import { RJSFSchema } from '@rjsf/utils';

const metaDataUiSchema = {
  description: {
    'ui:widget': 'textarea',
    'ui:options': {
      rows: 5,
    },
  },
  tags: {
    'ui:widget': 'tagTypeaheadWidget',
  },
};

export const schemas: JsonSchema[] = [
  {
    kind: 'Component',
    schema: componentSchema as RJSFSchema,
    uiSchema: {
      metadata: metaDataUiSchema,
      spec: {
        owner: {
          'ui:widget': 'entityKindTypeaheadWidget',
          'ui:options': {
            allowedKinds: ['Group', 'User'],
          },
        },
        dependsOn: {
          'ui:widget': 'entityKindTypeaheadWidget',
          'ui:options': {
            allowedKinds: ['Component', 'Resource'],
          },
        },
        system: {
          'ui:widget': 'entityKindTypeaheadWidget',
          'ui:options': {
            allowedKinds: ['System'],
          },
        },
        subcomponentOf: {
          'ui:widget': 'entityKindTypeaheadWidget',
          'ui:options': {
            allowedKinds: ['Component'],
          },
        },
        providesApis: {
          'ui:widget': 'entityKindTypeaheadWidget',
          'ui:options': {
            allowedKinds: ['Api'],
          },
        },
        consumesApis: {
          'ui:widget': 'entityKindTypeaheadWidget',
          'ui:options': {
            allowedKinds: ['Api'],
          },
        },
      },
    },
  },
  {
    kind: 'API',
    schema: apiSchema as RJSFSchema,
    uiSchema: {
      metadata: metaDataUiSchema,
      spec: {
        owner: {
          'ui:widget': 'entityKindTypeaheadWidget',
          'ui:options': {
            allowedKinds: ['Group', 'User'],
          },
        },
        system: {
          'ui:widget': 'entityKindTypeaheadWidget',
          'ui:options': {
            allowedKinds: ['System'],
          },
        },
      },
    },
  },
  {
    kind: 'Domain',
    schema: domainSchema as RJSFSchema,
    uiSchema: {
      metadata: metaDataUiSchema,
      spec: {
        owner: {
          'ui:widget': 'entityKindTypeaheadWidget',
          'ui:options': {
            allowedKinds: ['Group', 'User'],
          },
        },
      },
    },
  },
  {
    kind: 'Group',
    schema: groupSchema as RJSFSchema,
    uiSchema: {
      metadata: metaDataUiSchema,
      spec: {
        parent: {
          'ui:widget': 'entityKindTypeaheadWidget',
          'ui:options': {
            allowedKinds: ['Group'],
          },
        },
        children: {
          'ui:widget': 'entityKindTypeaheadWidget',
          'ui:options': {
            allowedKinds: ['Group'],
          },
        },
        members: {
          'ui:widget': 'entityKindTypeaheadWidget',
          'ui:options': {
            allowedKinds: ['User'],
          },
        },
      },
    },
  },
  {
    kind: 'Resource',
    schema: resourceSchema as RJSFSchema,
    uiSchema: {
      metadata: metaDataUiSchema,
      spec: {
        owner: {
          'ui:widget': 'entityKindTypeaheadWidget',
          'ui:options': {
            allowedKinds: ['Group', 'User'],
          },
        },
        system: {
          'ui:widget': 'entityKindTypeaheadWidget',
          'ui:options': {
            allowedKinds: ['System'],
          },
        },
        dependsOn: {
          'ui:widget': 'entityKindTypeaheadWidget',
          'ui:options': {
            allowedKinds: ['Component', 'Resource'],
          },
        },
        dependencyOf: {
          'ui:widget': 'entityKindTypeaheadWidget',
          'ui:options': {
            allowedKinds: ['Component', 'Resource'],
          },
        },
      },
    },
  },
  {
    kind: 'System',
    schema: systemSchema as RJSFSchema,
    uiSchema: {
      metadata: metaDataUiSchema,
      spec: {
        owner: {
          'ui:widget': 'entityKindTypeaheadWidget',
          'ui:options': {
            allowedKinds: ['Group', 'User'],
          },
        },
        domain: {
          'ui:widget': 'entityKindTypeaheadWidget',
          'ui:options': {
            allowedKinds: ['Domain'],
          },
        },
      },
    },
  },
  {
    kind: 'User',
    schema: userSchema as RJSFSchema,
    uiSchema: {
      metadata: metaDataUiSchema,
      spec: {
        memberOf: {
          'ui:widget': 'entityKindTypeaheadWidget',
          'ui:options': {
            allowedKinds: ['Group'],
          },
        },
      },
    },
  },
];
