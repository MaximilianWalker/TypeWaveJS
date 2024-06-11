import React, {
	useState,
	useEffect,
	useRef,
	useMemo,
	useImperativeHandle,
	forwardRef,
	memo
} from 'react';
import PropTypes from 'prop-types';
// import usePrevious from './hooks/usePrevious';
import {
	processEvent,
	processEvents,
	resetEvents,
	EVENT_TYPES
} from './utils/eventsUtils';
import {
	countCharacters,
	insertContentById,
	insertContentByPreference,
	removeContent,
	// removeElement,
} from './utils/elementsUtils';
import './typewave.css';

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
	const elementsSize = useMemo(() => countCharacters(elements), [elements]);
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
	), [elements, cursorIndex, showCursor, cursorCharacter]);

	// EVENTS
	const [events, setEvents] = useState(processEvents(eventsProp) ?? []);
	const [eventIndex, setEventIndex] = useState(0);
	const currentEvent = useMemo(() => (events[eventIndex] ? { ...events[eventIndex] } : null), [events, eventIndex]);

	const addEvent = (event) => setEvents(prevEvents => [
		...prevEvents,
		processEvent(event)
	]);

	const addImmediateEvent = (event) => setEvents(prevEvents => {
		const newEvents = [...prevEvents];
		newEvents.splice(eventIndex, event);
		return newEvents;
	});

	const onType = () => setElements((prevElements) => {
		const { value, instant, animation } = currentEvent;
		if (instant)
			return insertContentByPreference(prevElements, value, cursorIndex, 'outerMost');

		const { index, elements } = animation;
		const { element, parentId } = elements[index];
		if (parentId)
			return insertContentById(prevElements, parentId, element, cursorIndex !== 0 ? cursorIndex : null);
		else
			return insertContentByPreference(prevElements, element, cursorIndex !== 0 ? cursorIndex : null, 'outerMost');
	});

	const onMove = () => setCursorIndex((prevIndex) => {
		const newIndex = prevIndex + currentEvent.value;
		if (newIndex > 0)
			return 0;
		else if (Math.abs(newIndex) > elementsSize)
			return elementsSize;
		return newIndex;
	});

	const onDelete = () => setElements((prevElements) => removeContent(
		prevElements,
		elementsSize + cursorIndex - 1,
		elementsSize + cursorIndex
	));

	const onLoop = () => {
		setEvents(prevEvents => resetEvents(prevEvents));
		setEventIndex((currentEvent.value ?? 0) - 1);
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
		switch (currentEvent.type) {
			case 'type':
				animationFunction = onType;
				animationSpeed = currentEvent.delay ?? typeSpeed;
				break;
			case 'move':
				animationFunction = onMove;
				animationSpeed = currentEvent.delay ?? moveSpeed;
				break;
			case 'delete':
				animationFunction = onDelete;
				animationSpeed = currentEvent.delay ?? deleteSpeed;
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

		intervalRef.current = setTimeout(() => {
			if (animationFunction) animationFunction();
			if (onEvent) onEvent(currentEvent, eventIndex);

			const { animation, instant, remove } = currentEvent;

			if (instant) {
				console.log('instant')
				setEventIndex(prevIndex => prevIndex + 1);
				return;
			}

			if (remove) {
				console.log('remove')
				setEvents(prevEvents => prevEvents.filter((_, index) => index != eventIndex));
				return;
			}

			if (!animation) {
				setEventIndex(prevIndex => prevIndex + 1);
				return;
			}

			const { index, size } = animation;

			if (index >= size - 1)
				setEventIndex(prevIndex => prevIndex + 1);

			setEvents(prevEvents => prevEvents.map((event, i) => {
				if (i === eventIndex) {
					return {
						...event,
						animation: {
							...event.animation,
							index: index + 1
						}
					};
				}
				return event;
			}));
		}, animationSpeed);
	};

	const cancelAnimation = () => {
		if (intervalRef.current) {
			clearTimeout(intervalRef.current);
			intervalRef.current = null;
		}
	};

	useEffect(() => {
		if (play && !intervalRef.current && currentEvent)
			onAnimation();
		else if (!play && intervalRef.current)
			cancelAnimation();

		return () => cancelAnimation();
	}, [play, currentEvent]);

	return (
		<Component ref={ref} {...props}>
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
			delay: PropTypes.number,
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

export default memo(TypeWave);