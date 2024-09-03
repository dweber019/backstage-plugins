# Missing entity Backend

Welcome to the missing entity backend plugin!

## Setup

### Up and Running

Here's how to get the backend up and running:

1. First we need to add the `@dweber019/backstage-plugin-missing-entity-backend` package to your backend:

   ```sh
   # From the Backstage root directory
   yarn --cwd packages/backend add @dweber019/backstage-plugin-missing-entity-backend
   ```
   
2. In your `packages/backend/src/index.ts` make the following changes:

    ```diff
      import { createBackend } from '@backstage/backend-defaults';
    
      const backend = createBackend();
    
      // ... other feature additions
    
    + backend.add(import('@dweber019/backstage-plugin-missing-entity-backend'));
    
      backend.start();
    ```

The plugin options can be set through the `app-config.yaml`:

```yaml
missingEntity:
  schedule:
    frequency:
      minutes: 60
    timeout:
      minutes: 2
    initialDelay:
      seconds: 15
  age:
    days: 3
  batchSize: 2 # Default 500
  kindAndType: [ { kind: 'Component' }, { kind: 'Resource', type: 'db' }] # See config.d.ts for default
  excludeKindAndType: [] # See config.d.ts for default
```

## Plugin Option

### Batch Size

The missing entity backend is setup to process entities by acting as a queue where it will pull down all the applicable
entities from the catalog and add them to it's database (saving just the `entityRef`). Then it will grab the `n` oldest
entities that have not been processed to process them.

By default, 500 entities are pull and processed in 60 minutes (see config above). This means for every entity there is
around 7 seconds to get the relations and check them.

### Refresh

The default setup will only check missing entities once when processed.
If you want this process to also refresh the data you can do so by adding the `age`.

It's recommended that if you choose to use this configuration to set it to 3 days to update stale data.

## Limitations

### Relation limit

Currently, we only process the first 1000 relation per entity.
