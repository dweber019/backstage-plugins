import { SvgIcon, SvgIconProps } from '@material-ui/core';
import type { SimpleIcon } from 'simple-icons';
import { OptionalAppOptions } from '@backstage/app-defaults';
import * as icons from 'simple-icons';
import React from 'react';

export const createIcon = (icon: SimpleIcon, color = true, props?: SvgIconProps) => {
  const SimpleIcon: React.FC<SvgIconProps> = (iconProps) => {
    return (
      <SvgIcon {...iconProps}>
        <path d={icon.path} />
      </SvgIcon>
    );
  };
  let defaultProps = { titleAccess: icon.title, ...props };
  if (color) {
    defaultProps = { ...defaultProps, style: { color: `#${icon.hex}` } }
  }
  return () => {return <SimpleIcon {...defaultProps} />};
};

export const simpleIcons: OptionalAppOptions['icons'] =
  Object.keys(icons).map(key => {
    const icon = (icons as any)[key] as SimpleIcon;
    return { [icon.slug]: createIcon(icon, false), }
  }).reduce((previous, current) => ({ ...previous, ...current }));

export const simpleIconsColor: OptionalAppOptions['icons'] =
  Object.keys(icons).map(key => {
    const icon = (icons as any)[key] as SimpleIcon;
    return { [icon.slug]: createIcon(icon), }
  }).reduce((previous, current) => ({ ...previous, ...current }));
