import {
    addIdsToElements,
    getAnimationList,
    generateLineBreaks,
    elementsToJson,
    convertFragmentsToArrays,
    getElementsList
} from './elementsUtils';

export const EVENT_TYPES = [
    'type',
    'move',
    'delete',
    'pause',
    'loop',
    'options'
];

export function processEvent(event, priority = false) {
    const { type, value, instant, remove } = event;
    event = {
        ...event,
        priority,
        remove: remove != null ? remove : priority
    };

    if (type === 'type') {
        let newElements = generateLineBreaks(value);
        newElements = convertFragmentsToArrays(newElements);
        newElements = addIdsToElements(newElements);

        const animationElements = getAnimationList(newElements);
        event = {
            ...event,
            value: newElements,
            animation: !instant ? {
                elements: animationElements,
                index: 0,
                size: animationElements.length
            } : null,
        };
    } else if (['delete', 'move'].includes(event.type)) {
        event = {
            ...event,
            animation: !instant ? {
                index: 0,
                size: Math.abs(value)
            } : null
        };
    }
    return event;
}

export function processEvents(events, priority = false) {
    return events.map((event) => processEvent(event, priority));
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