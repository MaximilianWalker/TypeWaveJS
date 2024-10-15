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
	onEvent: onEventProp,
	onAnimation: onAnimationProp,
	onEnd: onEndProp,
	...props
}, ref) => {
	const intervalRef = useRef();

	const [initialized, setInitialized] = useState(false);

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
		setEventIndex(currentEvent.value ?? 0);
	};

	const onOptions = () => {
		const { cursorCharacter, typeSpeed, moveSpeed, deleteSpeed } = currentEvent;
		if (cursorCharacter) setCursorCharacter(cursorCharacter);
		if (typeSpeed) setTypeSpeed(typeSpeed);
		if (moveSpeed) setMoveSpeed(moveSpeed);
		if (deleteSpeed) setDeleteSpeed(deleteSpeed);
	};

	const getAnimationFunction = () => {
		switch (currentEvent.type) {
			case 'type':
				return {
					function: onType,
					speed: !currentEvent.instant ? (currentEvent.delay ?? typeSpeed) : 0
				};
			case 'move':
				return {
					function: onMove,
					speed: !currentEvent.instant ? (currentEvent.delay ?? moveSpeed) : 0
				};
			case 'delete':
				return {
					function: onDelete,
					speed: !currentEvent.instant ? (currentEvent.delay ?? deleteSpeed) : 0
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
			case 'execute':
				return {
					function: currentEvent.value,
					speed: 0
				};
		}
	};

	const onAnimation = () => {
		const {
			function: animationFunction,
			speed: animationSpeed
		} = getAnimationFunction();

		intervalRef.current = setTimeout(() => {
			if (animationFunction) animationFunction();

			if (['loop', 'options', 'execute']) return;

			const { type, animation, remove } = currentEvent;
			const { index, size } = animation ?? {};

			if (remove && (!animation || index >= size - 1)) {
				setEvents((prevEvents) => prevEvents.filter((_, index) => index != eventIndex));
				return;
			}

			if (!animation) {
				setEventIndex(eventIndex + 1);
				return;
			}

			// INCREMENT ANIMATION INDEX
			// NOTE: WE MUST USE THE OUTER INDEX TO AVOID DOUBLED UPDATES DUE TO REACT STRICK MODE, IF WE USE THE INNER INDEX, THE INDEX WILL BE INCREMENTED TWICE
			// NOTE 2: WE CAN'T USE THE OUTER EVENTS (UNLIKE THE OUTER INDEX) BECAUSE IMMEDIATE EVENTS MAY BE ADDED TO THE EVENTS ARRAY (OR OTHER MODIFICATIONS)
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

			// AFTER UPDATING ANIMATION INDEX, WE NEED CHECK IF THE ANIMATION IS FINISHED TO MOVE TO THE NEXT EVENT
			// NOTE: IF THE TYPE IS DELETE, IF THERE IS NO SIZE, THEN ALL ELEMENTS WILL BE DELETED
			if (
				(type === 'delete' && !size && elementsSize === 0) ||
				(size && index >= size - 1)
			) {
				setEventIndex(eventIndex + 1);
			}
		}, animationSpeed);
	};

	const cancelAnimation = () => {
		if (intervalRef.current) {
			clearTimeout(intervalRef.current);
			intervalRef.current = null;
		}
	};

	useEffect(() => {
		setInitialized(true);
		setElements([]);
		setEventIndex(0);
		setEvents(processEvents(eventsProp));
		return cancelAnimation;
	}, [eventsProp]);

	useEffect(() => {
		if (play && !intervalRef.current && currentEvent)
			onAnimation();
		else if (!play && intervalRef.current)
			cancelAnimation();

		return cancelAnimation;
	}, [play, currentEvent]);

	useEffect(() => {
		if (!initialized) return;

		if (onEventProp && currentEvent && (!currentEvent.animation || currentEvent.animation.index === 0))
			onEventProp(currentEvent, eventIndex);
		if (onEndProp && eventIndex === events.length)
			onEndProp();
	}, [currentEvent, onEventProp, onEndProp]);

	useEffect(() => {
		if (!priorityEventsProp) return;

		setEvents((prevEvents) => {
			const newEvents = [...prevEvents];
			const priorityEvents = processEvents(priorityEventsProp, true);
			const priorityIndex = newEvents.findLastIndex(event => event.priority);
			newEvents.splice(priorityIndex >= 0 ? priorityIndex + 1 : eventIndex, 0, ...priorityEvents);
			return newEvents;
		});
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
	onEvent: PropTypes.func,
	onAnimation: PropTypes.func,
	onEnd: PropTypes.func,
};

export default memo(TypeWave);