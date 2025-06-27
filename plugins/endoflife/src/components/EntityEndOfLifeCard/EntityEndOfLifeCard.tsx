import { useCallback, useEffect, useRef } from 'react';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
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
import { Grid, makeStyles } from '@material-ui/core';
import { HeightWidthType } from 'vis-timeline';
import { useEndOfLife } from '../../hooks';
import { HelpText } from '../HelpText/HelpText';

const useStyles = makeStyles(theme => ({
  visWrapper: {
    '@global': {
      '.vis-timeline': {
        border: 'none !important',
      },
      '.vis-label': {
        display: 'flex',
        alignItems: 'center',
        padding: `0 ${theme.spacing(1)}px`,
        color: 'inherit !important',
      },
      '.vis-text': {
        color: 'inherit !important',
      },
      '.vis-label .cycle': {
        fontWeight: 'bold !important',
      },
      '.vis-current-time': {
        backgroundColor: `${theme.palette.error.light} !important`,
      },
      '.vis-item': {
        borderRadius: `${theme.spacing(2)}px !important`,
        top: '10px !important',
      },
      '.vis-item.dateMissed': {
        backgroundColor: theme.palette.error.light,
        borderColor: theme.palette.error.dark,
        color: theme.palette.common.white,
        fontWeight: 'bold',
      },
      '.vis-item.dateClose': {
        backgroundColor: theme.palette.warning.light,
        borderColor: theme.palette.warning.dark,
        color: theme.palette.common.white,
        fontWeight: 'bold',
      },
      '.vis-item.dateOk': {
        backgroundColor: theme.palette.success.light,
        borderColor: theme.palette.success.dark,
        color: theme.palette.common.white,
        fontWeight: 'bold',
      },
      '.vis-tooltip': {
        padding: `${theme.spacing(1)}px !important`,
        color: `${theme.palette.common.white} !important`,
        zIndex: '1500 !important',
        fontSize: '0.625rem !important',
        borderRadius: `${theme.shape.borderRadius}px !important`,
        backgroundColor: `rgba(97, 97, 97, 0.9) !important`,
        border: 'none !important',
        boxShadow: 'none !important',
      },
    },
  },
}));

export type EntityEndOfLifeCardProps = {
  maxHeight?: HeightWidthType;
};

export const EntityEndOfLifeCard = ({
  maxHeight = 400,
}: EntityEndOfLifeCardProps) => {
  const classes = useStyles();
  const { entity } = useEntity<Entity>();

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
        className={classes.visWrapper}
        ref={containerRef}
      />
    </InfoCard>
  );
};
