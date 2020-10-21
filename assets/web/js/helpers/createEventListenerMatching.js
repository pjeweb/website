/**
 * Create an event listener that will call the passed handler if
 * the event matches the passed selector. This includes the event target element
 * and all its parent elements.
 *
 * @param {string} selector
 * @param {function(Event, Element): void} handler
 * @returns {EventListener}
 */
export default function createEventListenerMatching(selector, handler) {
    const listener = function (evt) {
        if (evt.target instanceof Element) {
            // target matches itself
            if (evt.target.matches(selector)) {
                handler(evt, evt.target)
            } else {
                // or maybe one of its parents
                const element = evt.target.closest(selector)
                if (element !== null) {
                    handler(evt, element)
                }
            }
        }
    }
    return listener
}