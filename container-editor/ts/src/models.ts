import { dia } from '@joint/plus';
import { colors, containerPalette } from './theme';

let containerColorIndex = 0;

function nextContainerColor(): string {
    const color = containerPalette[containerColorIndex % containerPalette.length];
    containerColorIndex++;
    return color;
}

function darken(hex: string): string {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.max(0, ((num >> 16) & 0xFF) - 30);
    const g = Math.max(0, ((num >> 8) & 0xFF) - 30);
    const b = Math.max(0, (num & 0xFF) - 30);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/** Column container that holds groups and elements. Positioned by the layout engine. */
export class ContainerModel extends dia.Element {

    preinitialize() {
        this.markup = [{
            tagName: 'rect',
            selector: 'body'
        }, {
            tagName: 'rect',
            selector: 'header'
        }, {
            tagName: 'rect',
            selector: 'headerClip'
        }, {
            tagName: 'text',
            selector: 'label'
        }];
    }

    defaults() {
        return {
            ...super.defaults,
            type: 'ContainerModel',
            size: { width: 200, height: 1000 },
            attrs: {
                root: {
                    containerSelector: 'body',
                },
                body: {
                    width: 'calc(w)',
                    height: 'calc(h)',
                    rx: 8,
                    ry: 8,
                    cursor: 'default',
                    fill: colors.containerFill,
                    stroke: colors.containerStroke
                },
                header: {
                    width: 'calc(w)',
                    height: 40,
                    rx: 8,
                    ry: 8,
                    fill: colors.containerHeaderFill,
                    stroke: 'none'
                },
                headerClip: {
                    width: 'calc(w)',
                    height: 24,
                    y: 16,
                    fill: colors.containerHeaderFill,
                    stroke: 'none'
                },
                label: {
                    fontFamily: 'sans-serif',
                    textVerticalAnchor: 'middle',
                    textAnchor: 'middle',
                    x: 'calc(0.5 * w)',
                    y: 20,
                    fontSize: 14,
                    fontWeight: 700,
                    fill: colors.containerLabelFill,
                    pointerEvents: 'none'
                }
            },
            z: 1
        };
    }

    static isContainer(el: dia.Element): el is ContainerModel {
        return el.get('type') === 'ContainerModel';
    }

    static create(name: string): ContainerModel {
        const fill = nextContainerColor();
        const headerFill = darken(fill);
        return new ContainerModel({
            attrs: {
                label: { text: name },
                body: { fill, stroke: headerFill },
                header: { fill: headerFill },
                headerClip: { fill: headerFill }
            }
        });
    }
}

/** Rectangular element that can be embedded in containers or groups. */
export class RectangleModel extends dia.Element {

    preinitialize() {
        this.markup = [{
            tagName: 'rect',
            selector: 'body'
        }, {
            tagName: 'text',
            selector: 'label'
        }];
    }

    defaults() {
        return {
            ...super.defaults,
            type: 'RectangleModel',
            size: { width: 50, height: 50 },
            z: 2,
            attrs: {
                root: {
                    highlighterSelector: 'body',
                },
                body: {
                    width: 'calc(w)',
                    height: 'calc(h)',
                    fill: colors.elementFill,
                    stroke: colors.elementStroke,
                    strokeWidth: 1,
                    rx: 4,
                    ry: 4
                },
                label: {
                    textVerticalAnchor: 'middle',
                    textAnchor: 'middle',
                    x: 'calc(0.5 * w)',
                    y: 'calc(0.5 * h)',
                    fontFamily: 'sans-serif',
                    fontSize: 11,
                    fill: colors.elementLabelFill
                }
            }
        };
    }
}

/** Elliptical element that can be embedded in containers or groups. */
export class CircleModel extends dia.Element {

    preinitialize() {
        this.markup = [{
            tagName: 'ellipse',
            selector: 'body'
        }, {
            tagName: 'text',
            selector: 'label'
        }];
    }

    defaults() {
        return {
            ...super.defaults,
            type: 'CircleModel',
            size: { width: 50, height: 50 },
            z: 2,
            attrs: {
                root: {
                    highlighterSelector: 'body',
                },
                body: {
                    cx: 'calc(0.5 * w)',
                    cy: 'calc(0.5 * h)',
                    rx: 'calc(0.5 * w)',
                    ry: 'calc(0.5 * h)',
                    fill: colors.elementFill,
                    stroke: colors.elementStroke,
                    strokeWidth: 1
                },
                label: {
                    textVerticalAnchor: 'middle',
                    textAnchor: 'middle',
                    x: 'calc(0.5 * w)',
                    y: 'calc(0.5 * h)',
                    fontFamily: 'sans-serif',
                    fontSize: 11,
                    fill: colors.elementLabelFill
                }
            }
        };
    }
}

/** Dashed-border group that can contain elements within a container. */
export class GroupModel extends dia.Element {

    static isGroup(el: dia.Element): el is GroupModel {
        return el.get('type') === 'GroupModel';
    }

    preinitialize() {
        this.markup = [{
            tagName: 'rect',
            selector: 'body'
        }, {
            tagName: 'text',
            selector: 'label'
        }];
    }

    defaults() {
        return {
            ...super.defaults,
            type: 'GroupModel',
            size: { width: 150, height: 100 },
            z: 2,
            attrs: {
                body: {
                    width: 'calc(w)',
                    height: 'calc(h)',
                    fill: colors.groupFill,
                    fillOpacity: 0.2,
                    stroke: colors.groupStroke,
                    strokeWidth: 1,
                    strokeDasharray: '5 3',
                    rx: 6,
                    ry: 6,
                },
                label: {
                    textVerticalAnchor: 'top',
                    textAnchor: 'middle',
                    x: 'calc(0.5 * w)',
                    y: 5,
                    fontFamily: 'sans-serif',
                    fontSize: 10,
                    fill: colors.groupLabelFill
                }
            }
        };
    }
}

/** Directed link with a rounded connector and arrow target marker. */
export class LinkModel extends dia.Link {

    preinitialize() {
        this.markup = [{
            tagName: 'path',
            selector: 'wrapper',
            attributes: {
                fill: 'none'
            }
        }, {
            tagName: 'path',
            selector: 'line',
            attributes: {
                fill: 'none'
            }
        }];
    }

    defaults() {
        return {
            ...super.defaults,
            type: 'LinkModel',
            attrs: {
                line: {
                    connection: true,
                    fill: 'none',
                    stroke: colors.linkStroke,
                    strokeWidth: 1.5,
                    strokeLinejoin: 'round',
                    targetMarker: {
                        type: 'path',
                        d: 'M 10 -5 0 0 10 5 z',
                        fill: 'context-stroke',
                        stroke: 'none'
                    }
                },
                wrapper: {
                    connection: true,
                    fill: 'none',
                    stroke: 'transparent',
                    strokeWidth: 20
                }
            }
        };
    }
}

/** Namespace for model/view resolution by the graph and paper. */
export const cellNamespace = {
    ContainerModel,
    RectangleModel,
    CircleModel,
    GroupModel,
    LinkModel
};
