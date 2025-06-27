import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { InfoCard } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { AboutField } from './AboutField';
import { RelationsWithLabel, useRelations } from '../../hooks';
import { Fragment } from 'react';

export interface EntityRelationsCardProps {
  title?: string;
  relations?: RelationsWithLabel[];
}

export const EntityRelationsCard = (props: EntityRelationsCardProps) => {
  const { title, relations } = props;
  const relationResult = useRelations(relations);

  return (
    <InfoCard title={title ?? 'Relations'}>
      <Grid container>
        {relationResult.map((relation, idx) => (
          <AboutField
            key={`relation-${idx}`}
            label={relation.label}
            gridSizes={{ xs: 12, sm: 6, lg: 4 }}
          >
            {relation.entityRefs.map((entityRef, idx2) => (
              <Fragment key={`entity-ref${idx2}`}>
                <EntityRefLink entityRef={entityRef} />
                {idx2 < relation.entityRefs.length - 1 && <span>, </span>}
              </Fragment>
            ))}
          </AboutField>
        ))}
      </Grid>
    </InfoCard>
  );
};
