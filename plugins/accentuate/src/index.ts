/** @packageDocumentation */

export {
  accentuatePlugin,
  EntityAccentuateInfo,
  AccentuatePage,
} from './plugin';
export { EntityLayoutWrapper } from './components/EntityLayoutWrapper';
export {
  EntityAccentuateDialog,
  EntityKindTypeahead,
  TagTypeahead,
} from './components/EntityAccentuateDialog';
export { accentuateApiRef, AccentuateClient } from './api';
export type * from './api';
export { schemas } from './schemas';
export { isAccentuateEnabled } from '@dweber019/backstage-plugin-accentuate-common';
