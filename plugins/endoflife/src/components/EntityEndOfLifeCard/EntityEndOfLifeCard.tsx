import React, { useCallback, useEffect, useRef } from 'react';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { appThemeApiRef, useApi } from '@backstage/core-plugin-api';
import { isEndOfLifeAvailable } from '../../conditions';
import { END_OF_LIFE_PRODUCTS_ANNOTATION } from '../../constants';
import {
  InfoCard,
  Progress,
  ResponseErrorPanel,
  WarningPanel,
} from '@backstage/core-components';
import { Timeline as Vis } from 'vis-timeline/standalone';
import { DateLegend } from '../DateLegend/DateLegend';
import {
  calculateMaxTime,
  calculateMinTime,
  calculateTimelineGroups,
  calculateTimelineItems,
} from './helper';
import './EntityEndOfLifeCard.css';
import { Grid } from '@material-ui/core';
import { HeightWidthType } from 'vis-timeline';
import { useEndOfLife } from '../../hooks';
import { HelpText } from '../HelpText/HelpText';

export type EntityEndOfLifeCardProps = {
  maxHeight?: HeightWidthType;
};

export const EntityEndOfLifeCard = ({
  maxHeight = 400,
}: EntityEndOfLifeCardProps) => {
  const { entity } = useEntity<Entity>();
  const appThemeApi = useApi(appThemeApiRef);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<Vis | null>(null);

  const { value, loading, error, title, link } = useEndOfLife();

  const initTimeline = useCallback(() => {
    if (!containerRef.current) return;
    if (!value) return;
    if (timelineRef.current) return;
    timelineRef.current = new Vis(
      containerRef.current,
      calculateTimelineItems(value),
      calculateTimelineGroups(value),
      {
        orientation: 'top',
        maxHeight,
        verticalScroll: true,
        stack: false,
        min: calculateMinTime(value),
        max: calculateMaxTime(value),
        zoomKey: 'ctrlKey',
      },
    );
  }, [value, containerRef, maxHeight]);

  useEffect(() => {
    initTimeline();
    return () => {
      timelineRef.current?.destroy();
      timelineRef.current = null;
    };
  }, [containerRef, value, initTimeline]);

  if (!isEndOfLifeAvailable(entity)) {
    return (
      <MissingAnnotationEmptyState
        annotation={END_OF_LIFE_PRODUCTS_ANNOTATION}
        readMoreUrl="https://github.com/dweber019/backstage-plugins/blob/main/plugins/endoflife"
      />
    );
  }
  if (loading) {
    return <Progress />;
  }
  if (error) {
    return <ResponseErrorPanel error={error} />;
  }
  if (!value) {
    return <WarningPanel title="Missing end of life data for annotation" />;
  }

  return (
    <InfoCard
      title={
        <Grid container justifyContent="space-between">
          <Grid item>{`End of life for ${title}`}</Grid>
          <Grid item>
            <DateLegend />
            <HelpText />
          </Grid>
        </Grid>
      }
      deepLink={{
        title: `View more for ${title}`,
        link: `${link}`,
      }}
      noPadding
    >
      <div
        className={`vis-${appThemeApi.getActiveThemeId()}`}
        ref={containerRef}
      />
    </InfoCard>
  );
};
