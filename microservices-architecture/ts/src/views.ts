import { dia, util } from '@joint/plus';
import { ContainerModel } from './models';
import { colors } from './theme';

const UpdateFlags = {
    Render: '@render',
    Update: '@update',
    Transform: '@transform'
};

/** Lightweight element view for the navigator mini-map. Renders a simple colored rect. */
export const NavigatorElementView = dia.ElementView.extend({
    body: null,
    markup: util.svg`<rect @selector="body" rx="3" ry="3" />`,
    initFlag: [UpdateFlags.Render, UpdateFlags.Update, UpdateFlags.Transform],
    presentationAttributes: {
        position: [UpdateFlags.Transform],
        angle: [UpdateFlags.Transform],
        size: [UpdateFlags.Update],
        type: [UpdateFlags.Update],
        attrs: [UpdateFlags.Update]
    },
    confirmUpdate: function(flags: number) {
        if (this.hasFlag(flags, UpdateFlags.Render)) this.render();
        if (this.hasFlag(flags, UpdateFlags.Update)) this.update();
        if (this.hasFlag(flags, UpdateFlags.Transform)) this.updateTransformation();
        return 0;
    },
    render: function() {
        const doc = util.parseDOMJSON(this.markup);
        this.body = doc.selectors.body;
        this.el.appendChild(doc.fragment);
        this.update();
        return this;
    },
    update: function() {
        const { model, body } = this;
        if (!body) return;
        const { width, height } = model.size();
        body.setAttribute('width', String(width));
        body.setAttribute('height', String(height));
        if (ContainerModel.isContainer(model)) {
            const fill = model.attr('body/fill') || colors.navigatorContainerFill;
            body.setAttribute('fill', fill);
            body.setAttribute('opacity', '0.6');
            body.setAttribute('stroke', colors.navigatorContainerStroke);
            body.setAttribute('stroke-width', '1');
        } else {
            body.setAttribute('fill', colors.navigatorElementFill);
            body.setAttribute('opacity', '0.5');
            body.setAttribute('stroke', 'none');
        }
    }
});
