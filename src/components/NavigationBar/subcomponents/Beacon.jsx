/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-shadow */
// Original source:
// https://github.com/Julian1729/react-status-beacon/blob/main/src/components/Beacon.js
import React from 'react';
import {
  defaultsDeep,
} from 'lodash';
import styled, {
  css, keyframes,
} from 'styled-components';

const generateAnimation = ({
  status, colors, scaleBeacon,
}) => {
  let color = null;
  let size = null;

  switch (status) {
    case 'positive':
      color = colors.positive;
      size = '200%'; // 250% is the normal/default size
      break;
    case 'neutral':
      color = colors.neutral;
      size = '200%';
      break;
    case 'negative':
      color = colors.negative;
      size = '250%';
      break;
    default:
      color = colors.dormant;
  }

  return keyframes`
  {
    0% {
      height: 75%;
      width: 75%;
      background-color: ${`${color}88`};
    }
    100% {
      ${
  scaleBeacon
    ? css`
              height: ${size};
              width: ${size};
            `
    : css`
              height: 250%;
              width: 250%;
            `
}
      background-color: ${`${color}07`};
    }
  }
`;
};

const mapStringToSpeed = (speed) => ({
  normal: '1500ms',
  fast: '800ms',
  slow: '2300ms',
}[speed] || '1500ms');

const mapPropToSpeed = (speed) => {
  if (typeof speed === 'number') {
    return `${speed}ms`;
  }
  return mapStringToSpeed(speed);
};

const Wrapper = styled.span`
  position: relative;
  display: inline-block;
  z-index: 1;
  ${({
    size,
  }) => css`
    height: ${size};
    width: ${size};
  `}
  vertical-align: middle;
  margin: 0 0.5em;
  &::after {
    content: '';
    height: 1em;
    width: 1em;
    // default to dormant color
    ${({
    colors,
  }) => css`
      background-color: ${colors.dormant};
    `}
    display: inline-block;
    border-radius: 100%;
    position: relative;
    height: 100%;
    width: 100%;
    ${({
    status, colors,
  }) => {
    switch (status) {
      case 'positive':
        return css`
            background-color: ${colors.positive};
          `;
      case 'neutral':
        return css`
            background-color: ${colors.neutral};
          `;
      case 'negative':
        return css`
            background-color: ${colors.negative};
          `;
      case 'dormant':
        return css`
            background-color: ${colors.dormant};
          `;
      default:
        return css`
            background-color: ${colors.dormant};
          `;
    }
  }}
  }
  &::before {
    content: '';
    height: 75%;
    width: 75%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 100%;
    background-color: #64cfb0;
    transform-origin: center center;
    z-index: -1;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    ${({
    status,
  }) => {
    switch (status) {
      case 'positive':
        return css`
            animation: ${(props) => generateAnimation(props)}
              ${({
    speed,
  }) => mapPropToSpeed(speed)} linear infinite;
          `;
      case 'neutral':
        return css`
            animation: ${(props) => generateAnimation(props)}
              ${({
    speed,
  }) => mapPropToSpeed(speed)} linear infinite;
          `;
      case 'negative':
        return css`
            animation: ${(props) => generateAnimation(props)}
              ${({
    speed,
  }) => mapPropToSpeed(speed)} linear infinite;
          `;
      default:
        return '';
    }
  }}
  }
`;

const Beacon = (props) => (
  <Wrapper
    {...defaultsDeep({}, props, {
      colors: {
        positive: '#21783e',
        neutral: '#ffdc00',
        negative: '#c13737',
        dormant: '#666666',
      },
      status: 'positive',
      speed: 'normal',
      scaleBeacon: true,
      size: '1em',
    })}
  />
);

export default Beacon;
