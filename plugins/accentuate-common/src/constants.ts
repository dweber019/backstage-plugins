import { Entity } from '@backstage/catalog-model';

export const DEFAULT_ALLOWED_KINDS = [
  'User',
  'Group',
  'Component',
  'Resource',
  'API',
  'System',
  'Domain',
];

export const ANNOTATION_ACCENTUATE_DISABLE = 'accentuate/disable';

export const isAccentuateEnabled = (entity: Entity) =>
  entity.metadata.annotations?.[ANNOTATION_ACCENTUATE_DISABLE] === undefined ||
  !Boolean(entity.metadata.annotations?.[ANNOTATION_ACCENTUATE_DISABLE]);
