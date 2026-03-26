import { dia } from '@joint/plus';
import { ContainerModel, RectangleModel, CircleModel, GroupModel, LinkModel } from './models';
import { addContainer } from './containers';

/**
 * Populates the graph with an example diagram: two containers with groups,
 * elements, and links demonstrating internal and cross-group connections.
 */
export function createExampleDiagram(graph: dia.Graph): void {
    addContainer(graph);
    addContainer(graph);

    const containers = graph.getElements().filter(el => ContainerModel.isContainer(el));
    const [c1, c2] = containers;

    // Container 1: a group with two rects and an internal link
    const group1 = new GroupModel({ position: { x: 15, y: 55 }, size: { width: 160, height: 120 }, attrs: { label: { text: 'Group A' } } });
    group1.addTo(graph);
    c1.embed(group1);

    const r1 = new RectangleModel({ position: { x: 25, y: 90 }, attrs: { label: { text: 'R1' } } });
    const r2 = new RectangleModel({ position: { x: 105, y: 90 }, attrs: { label: { text: 'R2' } } });
    r1.addTo(graph);
    r2.addTo(graph);
    group1.embed(r1);
    group1.embed(r2);

    const internalLink = new LinkModel({ source: { id: r1.id }, target: { id: r2.id } });
    internalLink.addTo(graph);

    // Container 2: a group with a circle and a standalone rect
    const group2 = new GroupModel({ position: { x: 15, y: 55 }, size: { width: 130, height: 100 }, attrs: { label: { text: 'Group B' } } });
    group2.addTo(graph);
    c2.embed(group2);

    const circle1 = new CircleModel({ position: { x: 50, y: 80 }, attrs: { label: { text: 'C1' } } });
    circle1.addTo(graph);
    group2.embed(circle1);

    const r3 = new RectangleModel({ position: { x: 15, y: 250 }, attrs: { label: { text: 'R3' } } });
    r3.addTo(graph);
    c2.embed(r3);

    // Cross-group link: R1 (Group A) → C1 (Group B)
    const crossLink1 = new LinkModel({ source: { id: r1.id }, target: { id: circle1.id } });
    crossLink1.addTo(graph);

    // Group-to-ungrouped link: R2 (Group A) → R3 (no group, in Container 2)
    const crossLink2 = new LinkModel({ source: { id: r2.id }, target: { id: r3.id } });
    crossLink2.addTo(graph);
}
