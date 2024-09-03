import { SchedulerServiceTaskScheduleDefinition } from '@backstage/backend-plugin-api';
import { HumanDuration } from '@backstage/types';

export interface Config {
  /** Configuration options for the missing entity plugin */
  missingEntity?: {
    schedule?: SchedulerServiceTaskScheduleDefinition;
    /**
     * @default 500
     */
    batchSize?: number;
    /**
     * Refresh missing entity
     */
    age?: HumanDuration;
    /**
     * @default [{ kind: 'API' }, { kind: 'Component'}, { kind: 'Resource'}, { kind: 'Group'}, { kind: 'Domain'}, { kind: 'System'}]
     */
    kindAndType?: { kind: string, type?: string }[];
    /**
     * @default []
     */
    excludeKindAndType?: { kind: string, type?: string }[];
  };
}
