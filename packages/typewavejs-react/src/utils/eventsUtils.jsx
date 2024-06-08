export const EVENT_TYPES = ['type', 'delete', 'move'];

export function processEvent(event) {
    const { type, value, instant } = event;
    if (type === 'type') {
        const newElements = addIdsToElements(value);
        event = {
            ...event,
            value: newElements,
            animation: !instant ? {
                elements: getAnimationList(newElements),
                index: 0,
                size: countCharacters(newElements)
            } : null,
        };
    } else if (['delete', 'move'].includes(event.type)) {
        event = {
            ...event,
            animationSize: !instant ? value : null
        };
    }
    return event;
}

export function processEvents(events) {
    return events.map(processEvent);
}

export function resetEvent(event) {
    const { type, animation } = event;
    if (animation && ['type', 'move', 'delete'].includes(type)) {
        event = {
            ...event,
            animation: {
                ...animation,
                index: 0
            }
        };
    }
    return event;
}

export function resetEvents(events) {
    return events.map(resetEvent);
}