/*
 * Copyright 2023 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Entity } from '@backstage/catalog-model';
import { IdentityApi } from '@backstage/core-plugin-api';

/** @public */
export const hasAnnotation = (entity: Entity, annotation: string) =>
  Boolean(!!entity.metadata.annotations?.[annotation]);

/** @public */
export const isEntityOfKind = (
  entity: Entity,
  kinds: Array<
    'api' | 'user' | 'group' | 'component' | 'resource' | 'system' | 'domain'
  >,
) => Boolean(kinds.includes(entity.kind.toLowerCase() as any));

/** @public */
export const isOwner = async (
  entity: Entity,
  identity: IdentityApi,
) => {
  const userIdentity = await identity.getBackstageIdentity();
  if (!['component', 'api', 'resource', 'system', 'domain'].includes(entity.kind.toLowerCase())) {
    return false
  }
  return userIdentity.ownershipEntityRefs.includes((entity.spec as { owner: string }).owner);
}
