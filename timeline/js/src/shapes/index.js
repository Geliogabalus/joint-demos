import { shapes } from '@joint/plus';
import { Event } from './Event';
import { Milestone } from './Milestone';
import { Category } from './Category';
import { StencilPlaceholder } from './StencilPlaceholder';

export { Event, Milestone, Category, StencilPlaceholder };

Object.assign(shapes, {
    timeline: {
        Event,
        Milestone,
        Category,
        StencilPlaceholder
    }
});
