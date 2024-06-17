import {
    addIdsToElements,
    getAnimationList,
    generateLineBreaks,
    elementsToJson,
    convertFragmentsToArrays
} from './elementsUtils';

export const EVENT_TYPES = [
    'type',
    'move',
    'delete',
    'pause',
    'loop',
    'options'
];

export function processEvent(event) {
    const { type, value, instant } = event;
    if (type === 'type') {
        let newElements = addIdsToElements(value);
        newElements = generateLineBreaks(newElements);
        // newElements = convertFragmentsToArrays(newElements);

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
                size: value
            } : null
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