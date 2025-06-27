import {
  CodeSnippet,
  Content,
  Header,
  Page,
  Table,
  TableColumn,
} from '@backstage/core-components';
import Alert from '@material-ui/lab/Alert';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { accentuateApiRef } from '../../api';
import { AccentuateResponse } from '@dweber019/backstage-plugin-accentuate-common';
import { EntityRefLink } from '@backstage/plugin-catalog-react';

export const AccentuatePage = () => {
  const accentuateApi = useApi(accentuateApiRef);

  const { value, loading, error } = useAsync(() => {
    return accentuateApi.getAll();
  }, [accentuateApi]);

  const tableColumns: TableColumn<AccentuateResponse>[] = [
    {
      field: 'entityRef',
      title: 'Entity',
      render: accentuate => <EntityRefLink entityRef={accentuate.entityRef} />,
    },
    {
      field: 'data',
      title: 'Data',
      render: accentuate => {
        return (
          <CodeSnippet
            text={JSON.stringify(accentuate.data, null, 2)}
            language="json"
          />
        );
      },
    },
    {
      field: 'changedAt',
      title: 'Changed at',
    },
    {
      field: 'changedBy',
      title: 'Changed by',
      render: accentuate => {
        if (accentuate.changedBy.startsWith('user:')) {
          return <EntityRefLink entityRef={accentuate.changedBy} />;
        }
        return accentuate.changedBy;
      },
    },
  ];

  return (
    <Page themeId="tool">
      <Header
        title="Accentuate"
        subtitle="All enitity which have been overwritten"
      />
      <Content>
        {error && <Alert severity="error">{error.message}</Alert>}
        <Table columns={tableColumns} data={value ?? []} isLoading={loading} />
      </Content>
    </Page>
  );
};
