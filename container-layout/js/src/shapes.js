import { dia } from '@joint/plus';

export class Container extends dia.Element {
    markup = [{
        tagName: 'rect',
        selector: 'body'
    }, {
        tagName: 'text',
        selector: 'label'
    }, {
        tagName: 'path',
        selector: 'grid',
        attributes: {
            'stroke': 'white',
            'stroke-opacity': 0.05,
            'fill': 'none'
        }
    }];

    defaults() {
        return {
            ...super.defaults,
            type: 'app.Container',
            z: 1,
            attrs: {
                body: {
                    width: 'calc(w)',
                    height: 'calc(h)',
                    cursor: 'default'
                },
                label: {
                    fontFamily: 'sans-serif',
                    textVerticalAnchor: 'middle',
                    textAnchor: 'middle',
                    x: 'calc(0.5 * w)',
                    y: 25,
                    fontSize: 16,
                    fontWeight: 700,
                    fill: '#FFFFFF',
                    style: { textTransform: 'uppercase' },
                    pointerEvents: 'none'
                }
            }
        };
    }

    static isContainer(el) {
        return el.get('type') === 'app.Container';
    }
}

export class Child extends dia.Element {
    markup = [{
        tagName: 'rect',
        selector: 'body',
    }, {
        tagName: 'text',
        selector: 'label'
    }];

    defaults() {
        return {
            ...super.defaults,
            type: 'app.Child',
            z: 2,
            attrs: {
                body: {
                    width: 'calc(w)',
                    height: 'calc(h)',
                    fill: '#FFFFFF',
                    stroke: 'none',
                    strokeWidth: 2
                },
                label: {
                    textVerticalAnchor: 'middle',
                    textAnchor: 'middle',
                    x: 'calc(0.5 * w)',
                    y: 'calc(0.5 * h)',
                    fontFamily: 'sans-serif',
                    fontSize: 16,
                    fontWeight: 700,
                    fill: '#FFFFFF',
                    style: { textTransform: 'uppercase' }
                }
            }
        };
    }
}

export class Link extends dia.Link {
    markup = [{
        tagName: 'path',
        selector: 'line'
    }];

    defaults() {
        return {
            ...super.defaults,
            type: 'Link',
            z: -1,
            attrs: {
                root: {
                    cursor: 'pointer'
                },
                line: {
                    fill: 'none',
                    connection: true,
                    stroke: '#A0A0A0',
                    strokeWidth: 1.5
                }
            }
        };
    }
}
