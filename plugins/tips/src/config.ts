import { createApiRef } from '@backstage/core-plugin-api';
import React from 'react';
import { Entity } from '@backstage/catalog-model';

export const tipsConfigRef = createApiRef<TipsConfig>({
  id: 'plugin.tips.config',
});

/** @public */
export interface TipsConfig {
  tips: Tip[];
}

/** @public */
export interface Tip {
  content: string | React.ReactElement;
  title: string;
  activate: (options: { entity?: Entity }) => boolean;
}
