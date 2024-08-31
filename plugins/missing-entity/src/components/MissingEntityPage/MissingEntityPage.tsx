import {
  Content,
  Header,
  Page, Select,
  Table,
  TableColumn,
} from '@backstage/core-components';
import Alert from '@material-ui/lab/Alert';
import React, { useCallback, useState } from 'react';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { missingEntityApiRef } from '../../api';
import { EntityMissingResults } from '@dweber019/backstage-plugin-missing-entity-common';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import ReplayIcon from '@material-ui/icons/Replay';
import { useAsyncRetry } from 'react-use';

export const MissingEntityPage = () => {
  const missingEntityApi = useApi(missingEntityApiRef);
  const identityApi = useApi(identityApiRef);
  const [withMissing, setWithMissing] = useState(true);
  const [myEntities, setMyEntities] = useState(true);

  const { value, loading, error, retry } = useAsyncRetry(async () => {
    const userIdentity = await identityApi.getBackstageIdentity();
    return missingEntityApi.getAllMissingEntities(withMissing, myEntities ? userIdentity.ownershipEntityRefs.join(',') : undefined);
  }, [missingEntityApi, identityApi, withMissing, myEntities]);

  const reloadEntity = useCallback(async (entityRef: string) => {
    await missingEntityApi.getMissingEntities(entityRef, true);
    retry();
  }, [missingEntityApi, retry]);

  const tableColumns: TableColumn<EntityMissingResults>[] = [
    {
      field: 'entityRef',
      title: 'Entity',
      render: item => <EntityRefLink entityRef={item.entityRef} />,
    },
    {
      field: 'missingEntityRefs',
      title: 'Missing entities',
      render: item => item.missingEntityRefs.join(', '),
    },
  ];

  return (
    <Page themeId="tool">
      <Header
        title="Missing entity"
        subtitle="All enitities which are proccessed"
      />
      <Content>
        {error && <Alert severity="error">{error.message}</Alert>}

        <Grid container>
          <Grid item xs={2}>
            <Typography variant="caption">Total: <Typography component="span">{value?.overview.entityCount}</Typography></Typography>
            <br/>
            <Typography variant="caption">Processed: <Typography
              component="span">{value?.overview.processedCount}</Typography></Typography>
            <br/>
            <Typography variant="caption">Pending: <Typography
              component="span">{value?.overview.pendingCount}</Typography></Typography>
            <br/>
            <Typography variant="caption">Stale: <Typography component="span">{value?.overview.staleCount}</Typography></Typography>
            <br/>
            <br/>

            <Select
              onChange={selected => setWithMissing(Boolean(selected))}
              selected={1}
              label="Only with missing entities"
              items={[
                {
                  label: 'Yes',
                  value: 1,
                },
                {
                  label: 'No',
                  value: 0,
                },
              ]}
            />
            <Select
              onChange={selected => setMyEntities(Boolean(selected))}
              selected={1}
              label="Only my entities"
              items={[
                {
                  label: 'Yes',
                  value: 1,
                },
                {
                  label: 'No',
                  value: 0,
                },
              ]}
            />
          </Grid>
          <Grid item xs={10}>
            <Table
              columns={tableColumns}
              data={value && value.entities || []}
              isLoading={loading}
              options={{
                pageSizeOptions: [10, 20, 50],
                pageSize: 10,
                actionsColumnIndex: 2,
              }}
              actions={[
                {
                  icon: () => <ReplayIcon />,
                  tooltip: "Reload",
                  onClick: (_event, rowData) => {
                    if (!Array.isArray(rowData)) {
                      reloadEntity(rowData.entityRef);
                    }
                  },
                },
              ]}
            />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
