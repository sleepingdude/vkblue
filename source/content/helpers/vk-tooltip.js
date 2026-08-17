import { waitForElement, CSSToObject, objectToCSS, onDocumentReady } from '../../utils/js-utils.js';

const tooltipBound = new WeakMap();

/**
 * @typedef {Object} TooltipOptions
 * @property {boolean} [black=false] - If true, the tooltip will have a dark style.
 * @property {string} text - The text to be displayed in the tooltip.
 * @property {Array<number>} [shift=[0, 0, 0]] - An array of three numbers specifying the offset of the tooltip along the X and Y axes. The first element is the X offset, the second is the Y offset, and the third is an additional Y offset.
 * @property {Function} [onCreate] - A function that will be called when the tooltip is created.
 * @property {boolean} [noZIndex=false] - If true, the tooltip will not have a z-index.
 * @property {boolean} [needLeft=false] - If true, the tooltip will be attached to the left edge of the element.
 * @property {string} [appendParentCls] - The class of the parent element to which the tooltip will be attached.
 * @property {boolean} [noload=false] - If true, the tooltip will not be loaded.
 * @property {string} [dir] - The direction in which the tooltip will be shown (up, down, left, right).
 * @property {boolean} [toup] - If true, the tooltip will be shown at the top.
 * @property {boolean} [forcetoup] - If true, forces the tooltip to be shown at the top.
 * @property {boolean} [forcetodown] - If true, forces the tooltip to be shown at the bottom.
 * @property {boolean} [forceright] - If true, forces the tooltip to be shown on the right.
 * @property {Array<number>} [forcexy] - Specific coordinates for the tooltip position.
 * @property {Array<number>} [forcesize] - Specific size for the tooltip.
 */


export function setVkTooltip(options) {
    let { container, text, fromInline, fromSibling, siblingElement, debug, tooltipOptions = {} } = options || {};
    debug = !!debug;

    const log = (...a) => { if (debug) console.log('[vkTooltip]', ...a); };
    const warn = (...a) => { if (debug) console.warn('[vkTooltip]', ...a); };
    const error = (...a) => { if (debug) console.error('[vkTooltip]', ...a); };

    const removeAllClones = () => {
        document.querySelectorAll('[data-vk-clone], [data-vk-injected-style]').forEach(el => el.remove());
    };

    if (!container) {
        error('container is required');
        return;
    }

    const tooltipBound = window.__vk_tooltipBound || (window.__vk_tooltipBound = new WeakMap());

    if (fromSibling) {
        let tooltipSelector = '.vkuiPopper, [role="tooltip"][id]';

        const onEnter = async (ev) => {
            const ctx = ev.currentTarget || container;
            if (ctx._vkTooltipClone || ctx._vkProcessing) {
                log('already processing/clone exists - skip');
                return;
            }
            ctx._vkProcessing = true;
            log('mouseenter');


            let injectedStyle = document.querySelector('[data-vk-injected-style]') || document.createElement('style');
            injectedStyle.setAttribute('data-vk-injected-style', '1');
            injectedStyle.textContent = `
                ${tooltipSelector}:not([data-vk-clone]) { visibility: hidden !important; }
                .AudioPlayerBlock__root { overflow: hidden; }
            `;
            try { document.head.appendChild(injectedStyle); }
            catch (e) {
                try { document.documentElement.appendChild(injectedStyle); } catch (e2) { log('failed append injectedStyle', e2); }
            }

            if (!siblingElement) {
                log('siblingElement is required for fromSibling branch');
                try { injectedStyle.remove(); } catch (e) { }
                ctx._vkProcessing = false;
                return;
            }

            try {
                siblingElement.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }));
                log('dispatched mouseover on siblingElement');
            } catch (e) {
                warn('dispatch mouseover failed', e);
            }


            let original = null;
            try {

                await waitForElement(tooltipSelector, siblingElement.parentElement, { timeout: 300 });

            } catch (e) {
                warn('tooltip did not appear:', e && e.message ? e.message : e);
                try { siblingElement.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, cancelable: true })); } catch (e2) { }
                try { injectedStyle.remove(); } catch (e3) { }
                ctx._vkProcessing = false;
                return;
            }

            let siblingTooltipId = siblingElement.getAttribute('aria-describedby');
            original = document.querySelector(tooltipSelector + `[id="${siblingTooltipId}"]`);

            if (!original) {
                log('original tooltip not found after wait');
                try { injectedStyle.remove(); } catch (e) { }
                ctx._vkProcessing = false;
                return;
            }

            log('original tooltip found', original);

            let clone;
            try {
                removeAllClones();
                clone = original.cloneNode(true);
            } catch (e) {
                error('cloneNode failed', e);
                try { injectedStyle.remove(); } catch (e2) { }
                ctx._vkProcessing = false;
                return;
            }

            try { if (clone.id) clone.removeAttribute('id'); } catch (e) { }
            try { clone.setAttribute('data-vk-clone', '1'); } catch (e) { }

            const savedCss = (original && original.style) ? original.style.cssText || '' : '';
            try { original._vkSavedStyle = savedCss; } catch (e) { }

            try {
                if (original && original.style) {
                    original.style.visibility = 'hidden';
                    original.style.pointerEvents = 'none';
                }
            } catch (e) { warn('hide original failed', e); }

            const rect = ctx.getBoundingClientRect();
            const topOffset = 40;
            const leftDelta = 20;

            try {
                const s = clone.querySelector && clone.querySelector('span');
                if (s) s.textContent = text;
            } catch (e) { }


            let cloneStyleObj = CSSToObject(original.style.cssText || '') || {};
            cloneStyleObj = Object.assign(cloneStyleObj, {
                position: 'fixed',
                inset: `${Math.round(rect.y + topOffset)}px auto auto ${Math.round(rect.x - leftDelta)}px`,
                pointerEvents: 'none',
                visibility: 'hidden',
                zIndex: (parseInt(cloneStyleObj.zIndex || '0', 10) || 999999).toString(),
            });


            try {
                clone.style.cssText = objectToCSS(cloneStyleObj);
            } catch (e) {
                warn('apply style to clone failed', e);
            }

            try {
                document.body.appendChild(clone);
                log('clone appended to body');
            } catch (e) {
                error('append clone failed', e);
                try { original.style.cssText = original._vkSavedStyle || ''; } catch (e2) { }
                try { injectedStyle.remove(); } catch (e3) { }
                ctx._vkProcessing = false;
                return;
            }

            try {
                let cloneArrowStyleObj = CSSToObject(original.children[0].style.cssText || '') || {};
                cloneArrowStyleObj = Object.assign(cloneArrowStyleObj, {
                    left: 'calc(50% - 10px)'//((clone.offsetWidth / 2) - (20 / 2)) + 'px',
                });

                clone.children[0].style.cssText = objectToCSS(cloneArrowStyleObj);
                clone.style.visibility = 'visible';
            } catch (e) {
                warn('apply arrow style failed', e);
            }

            ctx._vkTooltipClone = clone;
            ctx._vkTooltipOriginal = original;
            ctx._vkTooltipInjectedStyle = injectedStyle;
            ctx._vkProcessing = false;
            log('enter done');
        };

        const onLeave = (ev) => {
            const ctx = ev.currentTarget || container;
            log('mouseleave');

            try {
                if (ctx._vkTooltipClone) {
                    ctx._vkTooltipClone.remove();
                    ctx._vkTooltipClone = null;
                    log('clone removed');
                }
            } catch (e) { warn('remove clone failed', e); }

            try {
                const original = ctx._vkTooltipOriginal;
                if (original) {
                    original.style.cssText = original._vkSavedStyle || '';
                    delete original._vkSavedStyle;
                    ctx._vkTooltipOriginal = null;
                    log('original restored');
                }
            } catch (e) { warn('restore original failed', e); }

            try {
                if (siblingElement) siblingElement.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, cancelable: true }));
                log('dispatched mouseout to sibling');
            } catch (e) { warn('dispatch mouseout failed', e); }

            try {
                if (ctx._vkTooltipInjectedStyle) {
                    ctx._vkTooltipInjectedStyle.remove();
                    ctx._vkTooltipInjectedStyle = null;
                    log('injected style removed');
                }
            } catch (e) { warn('remove injected style failed', e); }

            try {
                const maybe = document.querySelector(tooltipSelector);
                if (maybe) maybe.style.visibility = 'hidden';
            } catch (e) { }

            ctx._vkProcessing = false;
        };

        try {
            container.removeEventListener('mouseenter', container._vk_onEnter);
            container.removeEventListener('mouseleave', container._vk_onLeave);
        } catch (e) { }

        container._vk_onEnter = onEnter;
        container._vk_onLeave = onLeave;
        container.addEventListener('mouseenter', onEnter);
        container.addEventListener('mouseleave', onLeave);

        log('fromSibling handlers attached');
        return;
    }

    if (tooltipBound.get(container)) return;

    let obj = Object.assign({ text: text, black: 1 }, tooltipOptions);
    if (fromInline) {
        container.setAttribute('onmouseover', `(globalThis?.showTooltip)(this, ${JSON.stringify(obj, null, 0)})`);
    } else {
        onDocumentReady(() => {
            const eventHandler = (event) => {
                const showTooltip = globalThis?.tooltips?.show || globalThis?.showTooltip;
                if (!showTooltip) return;
                showTooltip(container, obj);
            };

            container.addEventListener("mouseover", eventHandler);
            tooltipBound.set(container, true);
        });
    }
}


