import React, { useState } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { ApiEntity } from '@backstage/catalog-model';
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects';
import CloseIcon from '@material-ui/icons/Close';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import {
  Badge,
  Button,
  Fab,
  Grow,
  makeStyles,
  MobileStepper,
  Paper,
  Typography,
  Zoom,
} from '@material-ui/core';
import { MarkdownContent } from '@backstage/core-components';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { tipsConfigRef } from '../../config';
import useAsync from 'react-use/lib/useAsync';

const useStyles = makeStyles(theme => ({
  fabButton: {
    position: 'absolute',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: 1000,
    [theme.breakpoints.down('xs')]: {
      bottom: theme.spacing(9),
    },
  },
  paper: {
    position: 'absolute',
    bottom: theme.spacing(12),
    right: theme.spacing(3),
    padding: theme.spacing(3),
    display: 'none',
    zIndex: 1000,
    maxHeight: `calc(100vh - ${theme.spacing(29)}px)`,
    maxWidth: `calc(100vw - ${theme.spacing(34)}px)`,
    [theme.breakpoints.down('xs')]: {
      maxHeight: `calc(100vh - ${theme.spacing(38)}px)`,
      maxWidth: `calc(100vw - ${theme.spacing(6)}px)`,
      bottom: theme.spacing(18),
    },
  },
  paperContent: {
    overflowY: 'auto',
    overflowX: 'hidden',
    maxHeight: `calc(100vh - ${theme.spacing(41)}px)`,
    '&::-webkit-scrollbar': {
      width: '5px',
    },
    '&::-webkit-scrollbar-track': {
      background: theme.palette.grey.A100,
      borderRadius: '9999px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.grey.A200,
      borderRadius: '9999px',
    },
    [theme.breakpoints.down('xs')]: {
      maxHeight: `calc(100vh - ${theme.spacing(50)}px)`,
    },
  },
}));

export const EntityTipsDialog = () => {
  const classes = useStyles();
  const { entity } = useEntity<ApiEntity>();
  const tipsConfig = useApi(tipsConfigRef);
  const identity = useApi(identityApiRef);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const toggleDialog = () => setIsDialogOpen(!isDialogOpen);

  const [activeStep, setActiveStep] = React.useState(0);
  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };
  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const { value: tips, loading, error } = useAsync(async () => {
    setActiveStep(0);
    const resolvedActivates = await Promise.all(tipsConfig.tips.map(tip => tip.activate({ entity, identity })));
    return tipsConfig.tips.filter((_, index) => resolvedActivates[index]);
  }, [tipsConfig.tips, entity, identity]);

  if (loading || error || tips === undefined || tips.length === 0 || !tips[activeStep]) {
    return <></>;
  }

  return (
    <>
      <Zoom in>
        <Badge
          className={classes.fabButton}
          badgeContent={tips.length}
          color="secondary"
          max={99}
          overlap="circular"
          data-testid="tip-fab"
        >
          <Fab color="primary" aria-label="Tips" onClick={toggleDialog}>
            {isDialogOpen && <CloseIcon />}
            {!isDialogOpen && <EmojiObjectsIcon />}
          </Fab>
        </Badge>
      </Zoom>
      <Grow in={isDialogOpen} style={{ transformOrigin: 'bottom right' }}>
        <Paper
          elevation={3}
          className={classes.paper}
          style={{ display: isDialogOpen ? 'block' : 'none' }}
        >
          <div className={classes.paperContent} data-testid="tip-content">
            <Typography variant="h6" data-testid="tip-title">
              {tips[activeStep].title}
            </Typography>
            {typeof tips[activeStep].content === 'string' && (
              <MarkdownContent content={tips[activeStep].content as string} />
            )}
            {React.isValidElement(tips[activeStep].content) &&
              tips[activeStep].content}
          </div>
          <MobileStepper
            variant="dots"
            steps={tips.length}
            position="static"
            activeStep={activeStep}
            nextButton={
              <Button
                size="small"
                onClick={handleNext}
                disabled={activeStep === tips.length - 1}
              >
                <KeyboardArrowRightIcon />
              </Button>
            }
            backButton={
              <Button
                size="small"
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                <KeyboardArrowLeftIcon />
              </Button>
            }
          />
        </Paper>
      </Grow>
    </>
  );
};
