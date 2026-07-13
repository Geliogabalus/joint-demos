import { Idea, IdeaView } from './idea';
import { Connection } from './connection';

// Mirrors the shape of `graphUtils.ConstructTreeNode`, which `@joint/plus`
// no longer exports as a public type.
export interface TreeNode {
    children?: TreeNode[];
    [property: string]: any;
}

export function makeElement(node: TreeNode): Idea {
    const { children, ...attributes } = node;
    return new Idea({
        ...attributes,
        z: 2
    });
}

export function makeLink(parentElement: Idea, childElement: Idea): Connection {
    return new Connection({
        z: 1,
        source: {
            id: parentElement.id
        },
        target: {
            id: childElement.id
        },
        attrs: {
            line: {
                targetMarker: null
            }
        },
    });
}

export const shapes = {
    Idea,
    IdeaView,
    Connection
};
