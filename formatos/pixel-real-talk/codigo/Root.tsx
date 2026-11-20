import React from 'react';
import {Composition, Still} from 'remotion';
import {Video} from './Video';
import {Cover} from './Cover';
import tl from './timeline.json';
export const Root: React.FC = () => (
  <>
    <Composition id="Ubuntu" component={Video} durationInFrames={tl.frames} fps={30} width={1080} height={1920} />
    <Still id="CoverA" component={Cover as any} width={1080} height={1920} defaultProps={{variant: 'A'}} />
    <Still id="CoverB" component={Cover as any} width={1080} height={1920} defaultProps={{variant: 'B'}} />
  </>
);
