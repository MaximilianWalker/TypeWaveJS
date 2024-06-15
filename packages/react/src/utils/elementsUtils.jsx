import { cloneElement, isValidElement, Children, Fragment } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * Transforms a React element into a JSON representation.
 * @param {React.ReactElement} element - The React element to transform.
 * @returns {object} The JSON representation of the React element.
 */
export function elementsToJson(elements) {
    const _elementsToJson = (elements) => Children.map(elements, (element) => {
        if (
            typeof element === 'string' ||
            typeof element === 'number' ||
            typeof element === 'boolean' ||
            element == null
        )
            return element;

        if (!isValidElement(element))
            throw new Error('Element is not a valid React element');

        const type = element.type;
        const props = element.props;

        const elementType = typeof type === 'function'
            ? type.name || 'Anonymous'
            : type;

        return {
            type: elementType,
            props: {
                ...props,
                children: _elementsToJson(props.children)
            }
        };
    });

    return _elementsToJson(elements);
}

export function addIdsToElements(elements) {
    if (typeof elements === 'string')
        return elements;

    const _addIdsToElements = (element) => {
        if (!isValidElement(element)) return element;

        const id = uuidv4();
        return cloneElement(element, {
            id,
            key: id,
            children: Children.map(element.props.children, _addIdsToElements)
        });
    };

    return Array.isArray(elements) ? Children.map(elements, _addIdsToElements) : _addIdsToElements(elements);
}

// modify to add child index too, normal index will be renamed to iteration index
export function* iterateElements(elements, method = 'depth') {
    if (method !== 'depth' && method !== 'breadth')
        throw new Error('Method must be depth or breadth');

    if (elements == null) return elements;

    let index = 0;

    const toProcess = typeof elements === 'string' ?
        [{ element: elements, depth: 0 }]
        :
        Children.map(elements, child => ({ element: child, depth: 0 }));

    while (toProcess.length > 0) {
        const { element, parent, childIndex, depth } = method === 'depth' ? toProcess.pop() : toProcess.shift();

        if (!element) continue;
        yield {
            element,
            parent,
            iterationIndex: index,
            childIndex,
            depth
        };

        index++;

        if (isValidElement(element) && element.props.children) {
            const entries = Children.map(
                element.props.children,
                (child, childIndex) => ({
                    element: child,
                    parent: element,
                    childIndex,
                    depth: depth + 1
                })
            );

            if (method === 'depth')
                toProcess.push(...entries.reverse());
            else
                toProcess.push(...entries);
        }
    }
}

export function getElementsList(elements, method = 'depth') {
    return Array.from(iterateElements(elements, method));
}

export function generateElements(entries) {
    const recreate = (element) => {
        if (!isValidElement(element))
            return element;

        const newChildren = Children.map(element.props.children, child => recreate(child));

        return cloneElement(
            element,
            { ...element.props },
            newChildrenGenerator(element, newChildren)
        );
    };

    return Children.map(elements, element => recreate(element));
}

export function* iterateText(elements) {
    for (const { element } of iterateElements(elements)) {
        if (typeof element === 'string')
            yield element;
        else if (isValidElement(element) && element.props.children)
            yield* iterateText(element.props.children);
    }
}

// adjust to consider break lines
export function* iterateAnimation(elements) {
    let index = 0;
    let entries = [];

    for (let entry of iterateElements(elements)) {
        if (typeof entry.element === 'string') {
            let newElement = entry.element[0];
            for (const e of entries)
                newElement = cloneElement(e.element, null, newElement);

            yield {
                index,
                element: newElement,
                parentId: entries.length > 0 ? entries.at(-1)?.parent?.props.id : entry.parent?.props.id
            };

            entries = [];
            index++;

            for (let i = 1; i < entry.element.length; i++) {
                yield {
                    index,
                    element: entry.element[i],
                    parentId: entry.parent?.props.id
                };
                index++;
            }
        } else if (isValidElement(entry.element) && entry.element.type === 'br') {
            let newElement = entry.element;
            for (const e of entries)
                newElement = cloneElement(e.element, null, newElement);

            yield {
                index,
                element: newElement,
                parentId: entry.parent?.props.id
            };
            index++;
        } else if (isValidElement(entry.element)) {
            entries.unshift(entry);
        }
    }
}

export function getAnimationList(elements) {
    return Array.from(iterateAnimation(elements));
}

export function generateLineBreaks(elements) {
    const _generateLineBreaks = (elements) => Children.map(elements, (element, index) => {
        if (typeof element === 'string') {
            const lines = element.split('\n');
            const lastLine = lines.pop();
            return (
                <>
                    {lines.map((line, index) => (
                        <Fragment key={index}>
                            {line ? line : null}
                            <br />
                        </Fragment>
                    ))}
                    {lastLine ? lastLine : null}
                </>
            );
        } else if (isValidElement(element) && element.props.children) {
            return cloneElement(
                element,
                { key: index },
                _generateLineBreaks(element.props.children)
            );
        }
        return element;
    });

    return _generateLineBreaks(elements);
}

export function countCharacters(elements) {
    let _count = 0;

    const _countCharacters = (elements) => Children.forEach(elements, (child) => {
        if (typeof child === 'string')
            _count += child.length;
        else if (isValidElement(child) && child.props.children)
            _countCharacters(child.props.children);
    });

    _countCharacters(elements);
    return _count;
}

export function findElementAtIndex(parentNode, index) {
    if (!parentNode || typeof parentNode !== 'object' || !isValidElement(parentNode))
        throw new Error('Parent node is not a valid React element');

    let _currentIndex = 0;
    let _node = null;

    const _findElementAtIndex = (node) => Children.forEach(node.props.children, (child) => {
        if (typeof child === 'string') {
            if (_currentIndex <= index && index < _currentIndex + child.length)
                _node = node;
            _currentIndex += child.length;
        } else if (isValidElement(child)) {
            const result = _findElementAtIndex(child);
            if (result)
                _node = result;
        }
    });

    _findElementAtIndex(parentNode);
    return _node;
}

const shouldInsertLeftMost = ({ currentElement, textIndex, currentTextIndex }) => (
    typeof currentElement === 'string' &&
    ((textIndex === 0 && currentTextIndex === 0) || textIndex > currentTextIndex) &&
    textIndex <= currentTextIndex + currentElement.length
);

const shouldInsertRightMost = ({ currentElement, textIndex, currentTextIndex, totalLength }) => (
    typeof currentElement === 'string' &&
    textIndex >= currentTextIndex &&
    ((textIndex === totalLength && currentTextIndex + currentElement.length === totalLength) || textIndex < currentTextIndex + currentElement.length)
);

const shouldInsertOuterMost = ({ elements, currentElement, currentElementIndex, textIndex, currentTextIndex, depth, position, contentLength, content }) => {
    // if (textIndex === currentTextIndex &&
    //     currentElementIndex !== elements.length - 1 &&
    //     isValidElement(elements[currentElementIndex + 1]) &&
    //     position === 'after') {
    //     console.log(countCharacters(elements[currentElementIndex + 1]))
    //     console.log(elements[currentElementIndex + 1])
    // }
    if(content?.props?.id === 'cursor'){
        console.log('currentElement', currentElement);
        console.log('currentElementIndex', currentElementIndex);
        console.log('textIndex', textIndex);
        console.log('currentTextIndex', currentTextIndex);
        console.log('depth', depth);
        console.log('position', position);
        console.log('contentLength', contentLength);
        console.log('content', content);
    }
    return (
        (
            (
                typeof currentElement === 'string' &&
                textIndex >= currentTextIndex &&
                (
                    textIndex < currentTextIndex + currentElement.length ||
                    (
                        textIndex === currentTextIndex + currentElement.length &&
                        (
                            currentElementIndex === elements.length - 1 &&
                            depth === 0
                        )
                        ||
                        (
                            currentElementIndex !== elements.length - 1 &&
                            countCharacters(elements[currentElementIndex + 1]) > 0
                        )
                    )
                )
            )
            ||
            (
                isValidElement(currentElement) &&
                textIndex === currentTextIndex &&
                (
                    position === 'before' &&
                    contentLength > 0
                )
                ||
                (
                    position === 'after' &&
                    (
                        (
                            currentElementIndex === elements.length - 1 &&
                            depth === 0
                        )
                        ||
                        (
                            currentElementIndex !== elements.length - 1 &&
                            countCharacters(elements[currentElementIndex + 1]) > 0
                        )
                    )
                )
            )
        )
    );
}

const shouldInsertById = ({ currentElement, parent, id, textIndex, currentTextIndex }) => (
    (
        id == null || (parent != null && parent.props.id === id)
    )
    &&
    (
        (typeof currentElement === 'string' && textIndex >= currentTextIndex && textIndex <= currentTextIndex + currentElement.length) ||
        (isValidElement(currentElement) && textIndex === currentTextIndex)
    )
);

// export function insertElementsById(baseElements, id, index, elements) {
//     const _addElementsById = (elements) => Children.map(elements, (child, index) => {
//         if (isValidElement(child) && child.props.children) {
//             const newChildren = _addElementsById(child.props.children);
//             return cloneElement(child, { key: index, children: newChildren });
//         } else if (typeof child === 'string') {
//             return child;
//         } else {
//             if (child.props.id === id) {
//                 if (typeof content === 'string') {
//                     return `${child.slice(0, index)}${content}${child.slice(index)}`;
//                 } else if (isValidElement(content)) {
//                     return content;
//                 }
//             }
//             return child;
//         }
//     });
//     return _addElementsById(tree);
// }

export function addElements(elements, content, textIndex, shouldInsert) {
    if (Array.isArray(elements) && elements.length === 0)
        return [content];

    const totalLength = countCharacters(elements);
    const contentLength = countCharacters(content);

    if (textIndex < 0)
        textIndex = contentLength + textIndex;
    else if (textIndex == null)
        textIndex = totalLength;

    let currentTextIndex = 0;

    const _addElements = (elements, parent = null, depth = 0) => {
        const newElements = [];

        Children.forEach(elements, (currentElement, currentElementIndex) => {
            const _shouldInsert = (position) => shouldInsert({
                elements,
                parent,
                currentElement,
                currentElementIndex,
                textIndex,
                currentTextIndex,
                depth,
                totalLength,
                content,
                contentLength,
                position
            });

            if (typeof currentElement === 'string') {
                if (_shouldInsert()) {
                    const firstSlice = currentElement.slice(0, textIndex - currentTextIndex);
                    const lastSlice = currentElement.slice(textIndex - currentTextIndex);

                    if (typeof content === 'string') {
                        newElements.push(`${firstSlice}${content}${lastSlice}`);
                    } else if (isValidElement(content)) {
                        if (firstSlice) newElements.push(firstSlice);
                        newElements.push(content);
                        if (lastSlice) newElements.push(lastSlice);
                    }

                    currentTextIndex += contentLength;
                } else {
                    newElements.push(currentElement);
                }

                currentTextIndex += currentElement.length;
            } else if (isValidElement(currentElement) && currentElement.props.children) {
                if (_shouldInsert("before")) {
                    newElements.push(content);
                    currentTextIndex += contentLength;
                }

                const id = currentElement.props.id ?? uuidv4();
                newElements.push(cloneElement(
                    currentElement,
                    { id, key: id },
                    _addElements(currentElement.props.children, currentElement, depth + 1)
                ));

                if (_shouldInsert("after")) {
                    newElements.push(content);
                    currentTextIndex += contentLength;
                }
            } else {
                newElements.push(currentElement);
            }
        });

        return newElements;
    };

    return _addElements(elements);
}

export function addElementsById(elements, id, content, index = 0) {
    return addElements(elements, content, index, (entry) => shouldInsertById({ ...entry, id }));
}

export function addElementsByPreference(elements, content, index = 0, insertionPreference = 'outerMost') {
    let shouldInsert;

    if (insertionPreference === 'leftMost') shouldInsert = shouldInsertLeftMost;
    else if (insertionPreference === 'rightMost') shouldInsert = shouldInsertRightMost;
    else if (insertionPreference === 'outerMost') shouldInsert = shouldInsertOuterMost;
    else throw new Error('Ivalid option!');

    return addElements(elements, content, index, shouldInsert);
}

export function removeElements(elements, startIndex, endIndex = null, removeEmptyElements = true) {
    let _currentIndex = 0;

    const _removeElements = (elements) => Children.map(elements, (child) => {
        if (typeof child === 'string') {
            if (_currentIndex + child.length <= startIndex) {
                _currentIndex += child.length;
                return child;
            } else if (!endIndex || _currentIndex >= endIndex) {
                _currentIndex += child.length;
                return child;
            } else {
                const startSlice = Math.max(startIndex - _currentIndex, 0);
                const endSlice = endIndex ? Math.min(endIndex - _currentIndex, child.length) : null;
                _currentIndex += child.length;
                const newChild = child.slice(0, startSlice) + child.slice(endSlice);
                return !removeEmptyElements || newChild ? newChild : null;
            }
        } else if (isValidElement(child) && child.props.children) {
            const updatedChildren = _removeElements(child.props.children);
            return !removeEmptyElements || updatedChildren ?
                cloneElement(child,
                    {
                        key: uuidv4(),
                        children: updatedChildren
                    })
                :
                null;
        }
        return child;
    });

    return _removeElements(elements);
}

// review
export function removeElement(element, targetId) {
    const _removeElement = (currentElement) => {
        if (!isValidElement(currentElement) || !currentElement.props)
            return currentElement;

        if (currentElement.props.id === targetId)
            return null;

        if (currentElement.props.children) {
            const newChildren = Children.map(currentElement.props.children, child => {
                return _removeElement(child);
            }).filter(child => child !== null);

            if (newChildren.length !== Children.count(currentElement.props.children)) {
                return cloneElement(currentElement, {}, ...newChildren);
            }
        }

        return currentElement;
    }

    return _removeElement(element);
}