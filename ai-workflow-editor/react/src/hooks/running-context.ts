import { createContext } from 'react';

// Whether the workflow is running. Provided above the Paper so renderLink's flow animation
// (link-flow.tsx) can read it through React context (which flows through JointJS render portals).
export const RunningContext = createContext(false);
export const RunningProvider = RunningContext.Provider;
