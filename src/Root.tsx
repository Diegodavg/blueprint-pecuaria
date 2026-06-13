import React from 'react';
import {Composition} from 'remotion';
import {IntegumentarySystem} from './IntegumentarySystem';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="IntegumentarySystem"
        component={IntegumentarySystem}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
