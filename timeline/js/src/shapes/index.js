import { shapes } from '@joint/plus';
import { Event } from './Event';
import { Milestone } from './Milestone';
import { Category } from './Category';
import { StencilPlaceholder } from './StencilPlaceholder';

export { Event, Milestone, Category, StencilPlaceholder };

export const cellNamespace = {
    ...shapes,
    timeline: {
        Event,
        Milestone,
        Category,
        StencilPlaceholder
    }
};
