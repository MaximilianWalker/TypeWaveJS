import React, {
	useState,
	useEffect,
	useRef,
	useMemo,
	useImperativeHandle,
	forwardRef
} from 'react';
import PropTypes from 'prop-types';
import usePrevious from './hooks/usePrevious';
import {
	processEvent,
	processEvents,
	resetEvents,
	EVENT_TYPES
} from './utils/eventsUtils';
import {
	insertContentById,
	insertContentByPreference,
	removeContent,
	removeElement,
} from './utils/elementsUtils';
import './typewave.css';

// const instruction = {
// 	action: 'type',
// 	value: 'hello',
// 	options: {
// 		speed: 50
// 	},
// 	remove: true
// }

// const ACTIONS = {
// 	TYPE: 'type',
// 	DELETE: 'delete'
// };

const TypeWave = forwardRef(({
	play = true,
	events: eventsProp,
	component: Component = 'div',
	showCursor = true,
	cursorCharacter: cursorCharacterProp = '|',
	typeSpeed: typeSpeedProp = 250,
	moveSpeed: moveSpeedProp = 250,
	deleteSpeed: deleteSpeedProp = 250,
	onEvent,
	...props
}, ref) => {
	const intervalRef = useRef();

	// OPTIONS
	const [cursorCharacter, setCursorCharacter] = useState(cursorCharacterProp);
	const [typeSpeed, setTypeSpeed] = useState(typeSpeedProp);
	const [moveSpeed, setMoveSpeed] = useState(moveSpeedProp);
	const [deleteSpeed, setDeleteSpeed] = useState(deleteSpeedProp);

	const cursor = useMemo(() => (
		<span id="cursor" key="cursor" className="typewriter__cursor">
			{cursorCharacter}
		</span>
	), [cursorCharacter]);

	// ELEMENTS
	const [elements, setElements] = useState([]);
	const [cursorIndex, setCursorIndex] = useState(0);
	const processedElements = useMemo(() => (
		showCursor ?
			insertContentByPreference(
				elements,
				cursor,
				cursorIndex !== 0 ? cursorIndex : null,
				'outerMost'
			)
			:
			elements
	), [elements]);

	// EVENTS STATES
	const [events, setEvents] = useState(processEvents(eventsProp) ?? []);
	const [eventIndex, setEventIndex] = useState(0);
	const currentEvent = useMemo(() => events[eventIndex], [events, eventIndex]);

	const prevPlay = usePrevious(play);

	// const [iteration, setIteration] = useState(0);

	// const [repeat, setRepeat] = useState(false);

	const addEvent = (event) => setEvents(prevEvents => [
		...prevEvents,
		processEvent(event)
	]);

	const addImmediateEvent = (event) => {

		setEvents(prevEvents => {
			const newEvents = [...prevEvents];
			newEvents.splice(eventIndex, event);
			return newEvents;
		});
	};

	const onType = () => setElements((prevElements) => {
		const { value, instant, animation } = currentEvent;
		if (instant) {
			return insertContentByPreference(prevElements, value, cursorIndex, 'outerMost');
		} else {
			const { index, elements } = animation;
			const { element, parentId } = elements[index];
			if (parentId)
				return insertContentById(prevElements, parentId, element, cursorIndex);
			else
				return insertContentByPreference(prevElements, element, cursorIndex, 'outerMost');
		}
	});

	const onMove = () => setElements((prevElements) => {
		let newElements = removeElement(prevElements, 'cursor');
		return insertContentByPreference();
	});

	const onDelete = () => setElements((prevElements) => (
		cursorIndex > 0 ? removeContent(prevElements, cursorIndex - 1, cursorIndex) : prevElements
	));

	// const onPause = () => {

	// };

	const onLoop = () => {
		setEvents(prevEvents => resetEvents(prevEvents));
		setEventIndex(currentEvent.value ?? 0);
	};

	const onOptions = () => {
		const { cursorCharacter, typeSpeed, moveSpeed, deleteSpeed } = currentEvent;
		if (cursorCharacter) setCursorCharacter(cursorCharacter);
		if (typeSpeed) setTypeSpeed(typeSpeed);
		if (moveSpeed) setMoveSpeed(moveSpeed);
		if (deleteSpeed) setDeleteSpeed(deleteSpeed);
	};

	const onAnimation = () => {
		let animationFunction;
		let animationSpeed;
		console.log(currentEvent)
		switch (currentEvent.type) {
			case 'type':
				animationFunction = onType;
				animationSpeed = currentEvent.typeSpeed ?? typeSpeed;
				break;
			case 'move':
				animationFunction = onMove;
				animationSpeed = currentEvent.moveSpeed ?? moveSpeed;
				break;
			case 'delete':
				animationFunction = onDelete;
				animationSpeed = currentEvent.deleteSpeed ?? deleteSpeed;
				break;
			case 'pause':
				animationFunction = null;
				animationSpeed = currentEvent.value;
				break;
			case 'loop':
				animationFunction = onLoop;
				animationSpeed = 0;
				break;
			case 'options':
				animationFunction = onOptions;
				animationSpeed = 0;
				break;
		}

		intervalRef.current = setInterval(() => {
			if (animationFunction) animationFunction();
			if (onEvent) onEvent(currentEvent, eventIndex);

			const { animation, remove } = currentEvent;
			const { index, size } = animation;

			if (!size || !index || index === size) {
				if (remove) {
					setEvents(prevEvents => prevEvents.filter((_, index) => index != eventIndex));
				} else if (eventIndex < events.length) {
					setEventIndex(prevIndex => prevIndex + 1);
				}
			} else {
				setEvents(prevEvents => prevEvents.map((event, i) => {
					if (i === eventIndex)
						event.animation.index++;
					return event;
				}));
			}
		}, animationSpeed);
	};

	useEffect(() => {
		if (play && currentEvent)
			onAnimation();
		else
			clearInterval(intervalRef.current);
		return () => clearInterval(intervalRef.current);
	}, [play, currentEvent]);

	console.log('elements', elements);
	console.log('processedElements', processedElements);

	return (
		<Component {...props}>
			{processedElements}
		</Component>
	);
});

TypeWave.propTypes = {
	play: PropTypes.bool,
	events: PropTypes.arrayOf(
		PropTypes.shape({
			type: PropTypes.oneOf(EVENT_TYPES).isRequired,
			value: PropTypes.any.isRequired,
			typeSpeed: PropTypes.number,
			moveSpeed: PropTypes.number,
			deleteSpeed: PropTypes.number,
			instant: PropTypes.bool,
			remove: PropTypes.bool
		})
	).isRequired,
	component: PropTypes.elementType,
	showCursor: PropTypes.bool,
	cursorCharacter: PropTypes.string,
	typeSpeed: PropTypes.number,
	moveSpeed: PropTypes.number,
	deleteSpeed: PropTypes.number,
	onEvent: PropTypes.func
};

export default TypeWave;