import {
	useState,
	useEffect,
	useRef,
	useMemo,
	forwardRef,
	memo
} from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import {
	processEvents,
	resetEvents,
	EVENT_TYPES
} from './utils/eventsUtils';
import {
	countCharacters,
	addElementsById,
	addElementsByPreference,
	removeElements
} from './utils/elementsUtils';
import './typewave.css';

const TypeWave = forwardRef(({
	play = true,
	events: eventsProp,
	priorityEvents: priorityEventsProp,
	component: Component = 'span',
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

	// ELEMENTS
	const [elements, setElements] = useState([]);
	const [cursorIndex, setCursorIndex] = useState(0);
	const elementsSize = useMemo(() => countCharacters(elements), [elements]);

	// EVENTS
	const [events, setEvents] = useState([]);
	const [eventIndex, setEventIndex] = useState(0);
	const currentEvent = useMemo(
		() => (events[eventIndex] ? { ...events[eventIndex] } : null),
		[events, eventIndex]
	);

	// CURSOR
	const cursor = (
		<span id="cursor" key={uuidv4()} className="typewave__cursor">
			{cursorCharacter}
		</span>
	);

	const onType = () => setElements((prevElements) => {
		const { value, instant, animation } = currentEvent;
		if (instant)
			return addElementsByPreference(prevElements, value, cursorIndex !== 0 ? cursorIndex : null, 'outerMost');

		const { index, elements } = animation;

		if (index < elements.length) {
			const { element, parentId } = elements[index];
			console.log(element)
			if (parentId)
				return addElementsById(prevElements, parentId, element, cursorIndex !== 0 ? cursorIndex : null);
			else
				return addElementsByPreference(prevElements, element, cursorIndex !== 0 ? cursorIndex : null, 'outerMost');
		}
		return prevElements;
	});

	const onMove = () => setCursorIndex((prevIndex) => {
		const { value, instant, animation } = currentEvent;

		let newIndex = prevIndex;
		if (instant)
			newIndex += value;
		else if (value > 0)
			newIndex += 1;
		else if (value < 0)
			newIndex -= 1;

		if (newIndex > 0)
			return 0;
		else if (Math.abs(newIndex) > elementsSize)
			return elementsSize;

		return newIndex;
	});

	const onDelete = () => setElements((prevElements) => {
		const { value, instant } = currentEvent;

		return removeElements(
			prevElements,
			elementsSize + cursorIndex - (instant ? value : 1),
			elementsSize + cursorIndex
		);
	});

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

	const getAnimationFunction = (type) => {
		switch (type) {
			case 'type':
				return {
					function: onType,
					speed: currentEvent.delay ?? typeSpeed
				};
			case 'move':
				return {
					function: onMove,
					speed: currentEvent.delay ?? moveSpeed
				};
			case 'delete':
				return {
					function: onDelete,
					speed: currentEvent.delay ?? deleteSpeed
				};
			case 'pause':
				return {
					function: null,
					speed: currentEvent.value
				};
			case 'loop':
				return {
					function: onLoop,
					speed: 0
				};
			case 'options':
				return {
					function: onOptions,
					speed: 0
				};
		}
	};

	const onAnimation = () => {
		const {
			function: animationFunction,
			speed: animationSpeed
		} = getAnimationFunction(currentEvent.type);

		intervalRef.current = setTimeout(() => {
			if (animationFunction) animationFunction();
			if (onEvent) onEvent(currentEvent, eventIndex);

			const { type, animation, instant, remove } = currentEvent;

			if (remove) {
				setEvents((prevEvents) => prevEvents.filter((_, index) => index != eventIndex));
				return;
			}

			if (instant || !animation) {
				setEventIndex(prevIndex => prevIndex + 1);
				return;
			}

			const { index, size } = animation;

			// CHECK IF ANIMATION IS FINISHED
			if (
				(type === 'delete' && !size && elementsSize === 1) ||
				(size && index >= size - 1)
			)
				setEventIndex(prevIndex => prevIndex + 1);

			// INCREMENT ANIMATION INDEX
			// NOTE: WE MUST USE THE OUTER INDEX TO AVOID DOUBLED UPDATES DUE TO REACT STRICK MODE, IF WE USE THE INNER INDEX, THE INDEX WILL BE INCREMENTED TWICE
			setEvents((prevEvents) => {
				const newEvents = [...prevEvents];
				newEvents[eventIndex] = {
					...newEvents[eventIndex],
					animation: {
						...newEvents[eventIndex].animation,
						index: index + 1
					}
				};
				return newEvents;
			});
		}, animationSpeed);
	};

	const cancelAnimation = () => {
		if (intervalRef.current) {
			clearTimeout(intervalRef.current);
			intervalRef.current = null;
		}
	};

	useEffect(() => {
		setEvents(processEvents(eventsProp));
		return () => {
			cancelAnimation();
			setEventIndex(0);
			setElements([]);
		};
	}, [eventsProp]);

	useEffect(() => {
		if (play && !intervalRef.current && currentEvent)
			onAnimation();
		else if (!play && intervalRef.current)
			cancelAnimation();

		return () => cancelAnimation();
	}, [play, currentEvent]);

	useEffect(() => {
		if (priorityEventsProp) {
			setEvents((prevEvents) => {
				console.log(prevEvents)
				const newEvents = [...prevEvents];
				const priorityEvents = processEvents(priorityEventsProp, true);
				const priorityIndex = newEvents.findLastIndex(event => event.priority);
				newEvents.splice(priorityIndex >= 0 ? priorityIndex + 1 : eventIndex, 0, ...priorityEvents);
				return newEvents;
			});
		}
	}, [priorityEventsProp]);

	return (
		<Component ref={ref} {...props}>
			{
				showCursor ?
					addElementsByPreference(
						elements,
						cursor,
						cursorIndex !== 0 ? cursorIndex : null,
						'outerMost'
					)
					:
					elements
			}
		</Component>
	);
});

const eventShape = PropTypes.shape({
	type: PropTypes.oneOf(EVENT_TYPES).isRequired,
	value: PropTypes.any,
	delay: PropTypes.number,
	instant: PropTypes.bool,
	remove: PropTypes.bool,
	priority: PropTypes.bool
});

TypeWave.propTypes = {
	play: PropTypes.bool,
	events: PropTypes.arrayOf(eventShape).isRequired,
	priorityEvents: PropTypes.arrayOf(eventShape),
	component: PropTypes.elementType,
	showCursor: PropTypes.bool,
	cursorCharacter: PropTypes.string,
	typeSpeed: PropTypes.number,
	moveSpeed: PropTypes.number,
	deleteSpeed: PropTypes.number,
	onEvent: PropTypes.func
};

export default memo(TypeWave);