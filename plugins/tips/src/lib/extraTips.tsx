import { Tip } from '../config';
import { hasAnnotation, isEntityOfKind } from './utils';
import { CodeSnippet } from '@backstage/core-components';
import React from 'react';
import {
  ApiEntity,
  ComponentEntity,
  GroupEntity,
  ResourceEntity,
  SystemEntity,
} from '@backstage/catalog-model';

/** @public */
export const extraTips: Tip[] = [
  {
    title: 'Documentation missing',
    content: `You should have some documentation by adding the annotation \`backstage.io/techdocs-ref\`.  
You can find details at [How to understand techdocs-ref annotation values](https://backstage.io/docs/features/techdocs/how-to-guides#how-to-understand-techdocs-ref-annotation-values).
    `,
    activate: ({ entity }) =>
      !!entity &&
      isEntityOfKind(entity, ['component', 'api', 'system']) &&
      !hasAnnotation(entity, 'backstage.io/techdocs-ref'),
  },
  {
    title: 'Links missing',
    content: (
      <>
        No links defined for this entity. You can add links to your entity YAML
        as shown in the highlighted example below:
        <CodeSnippet
          language="yaml"
          showLineNumbers
          highlightedNumbers={[3, 4, 5, 6]}
          text={`metadata:
name: example
links:
  - url: https://dashboard.example.com
    title: My Dashboard
    icon: dashboard`}
        />
      </>
    ),
    activate: ({ entity }) =>
      (!!entity &&
        Array.isArray(entity.metadata.links) &&
        entity.metadata.links.length === 0) ||
      (!!entity && !entity.metadata.links),
  },
  {
    title: 'System missing',
    content: (
      <>
        With increasing complexity in software, systems form an important
        abstraction level to help us reason about software ecosystems.
        <br />
        Systems are a useful concept in that they allow us to ignore the
        implementation details of a certain functionality for consumers, <br />
        while allowing the owning team to make changes as they see fit (leading
        to low coupling).
        <CodeSnippet
          language="yaml"
          showLineNumbers
          highlightedNumbers={[3, 4]}
          text={`metadata:
name: example
spec:
  system: "your system"`}
        />
      </>
    ),
    activate: ({ entity }) =>
      !!entity &&
      isEntityOfKind(entity, ['component', 'api', 'resource']) &&
      !(entity as ComponentEntity | ApiEntity | ResourceEntity).spec.system,
  },
  {
    title: 'Members missing',
    content: (
      <>
        A group describes an organizational entity, such as for example a team,
        a business unit, <br />
        or a loose collection of people in an interest group.
        <CodeSnippet
          language="yaml"
          showLineNumbers
          highlightedNumbers={[3, 4, 5, 6, 7]}
          text={`metadata:
name: example
spec:
  members:
  - member1
  - member2
  - ...`}
        />
      </>
    ),
    activate: ({ entity }) =>
      (!!entity &&
        isEntityOfKind(entity, ['group']) &&
        !(entity as GroupEntity).spec.members) ||
      (Array.isArray((entity as GroupEntity).spec.members) &&
        (entity as GroupEntity).spec.members!.length === 0),
  },
  {
    title: 'Domain missing',
    content: (
      <>
        While systems are the basic level of encapsulation for related entities,
        it is often useful to group a collection of systems that share <br />
        terminology, domain models, metrics, KPIs, business purpose, or
        documentation, i.e. they form a bounded context.
        <CodeSnippet
          language="yaml"
          showLineNumbers
          highlightedNumbers={[3, 4]}
          text={`metadata:
name: example
spec:
  domain: "your domain"`}
        />
      </>
    ),
    activate: ({ entity }) =>
      !!entity &&
      isEntityOfKind(entity, ['system']) &&
      !(entity as SystemEntity).spec.domain,
  },
];
