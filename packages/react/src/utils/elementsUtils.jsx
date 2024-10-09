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

    const result = Array.isArray(elements) ? Children.map(elements, _addIdsToElements) : _addIdsToElements(elements);
    if (!Array.isArray(elements)) {
        if (result.length === 1)
            return result[0];
        else if (result.length === 0)
            return null;
    }
    return result;
}

export function convertFragmentsToArrays(elements) {
    const _convertFragmentsToArrays = (elements) => Children.map(elements, (element) => {
        if (isValidElement(element) && element.type === Fragment)
            return _convertFragmentsToArrays(element.props.children);
        return element;
    });

    return _convertFragmentsToArrays(elements);
}

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
        const { element, parent, childIndex, depth } = toProcess.shift();

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
                toProcess.unshift(...entries);
            else
                toProcess.push(...entries);
        }
    }
}

export function getElementsList(elements, method = 'depth') {
    return Array.from(iterateElements(elements, method));
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

            entries = [];
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

    const result = _generateLineBreaks(elements);
    if (!Array.isArray(elements)) {
        if (result.length === 1)
            return result[0];
        else if (result.length === 0)
            return null;
    }
    return result;
}

export function countCharacters(elements) {
    let _count = 0;

    const _countCharacters = (elements) => Children.forEach(elements, (child) => {
        if (typeof child === 'string')
            _count += child.length;
        else if (isValidElement(child) && child.type === 'br')
            _count += 1;
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

const shouldInsertLeftMost = ({ currentElement, insertingTextIndex, currentTextIndex }) => (
    typeof currentElement === 'string' &&
    ((insertingTextIndex === 0 && currentTextIndex === 0) || insertingTextIndex > currentTextIndex) &&
    insertingTextIndex <= currentTextIndex + currentElement.length
);

const shouldInsertRightMost = ({ currentElement, insertingTextIndex, currentTextIndex, totalLength }) => (
    typeof currentElement === 'string' &&
    insertingTextIndex >= currentTextIndex &&
    ((insertingTextIndex === totalLength && currentTextIndex + currentElement.length === totalLength) || insertingTextIndex < currentTextIndex + currentElement.length)
);

const shouldInsertOuterMost = ({ elements, currentElement, currentElementIndex, insertingTextIndex, currentTextIndex, depth, position, contentLength }) => (
    (
        (
            typeof currentElement === 'string' &&
            insertingTextIndex >= currentTextIndex &&
            (
                insertingTextIndex < currentTextIndex + currentElement.length ||
                (
                    insertingTextIndex === currentTextIndex + currentElement.length &&
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
        ||
        (
            (
                isValidElement(currentElement) ||
                Array.isArray(currentElement)
            ) &&
            insertingTextIndex === currentTextIndex &&
            (
                (
                    position === 'before' &&
                    contentLength > 0 &&
                    (
                        (
                            currentElementIndex === 0 &&
                            depth === 0
                        )
                        ||
                        (
                            currentElementIndex !== 0 &&
                            countCharacters(elements[currentElementIndex + 1]) > 0 &&
                            typeof elements[currentElementIndex - 1] !== 'string'
                        )
                    )
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
                            countCharacters(elements[currentElementIndex + 1]) > 0 &&
                            typeof elements[currentElementIndex + 1] !== 'string'
                        )
                    )
                )
            )
        )
    )
);

const shouldInsertById = ({ currentElement, parent, id, insertingTextIndex, currentTextIndex }) => (
    (
        id == null || (parent != null && parent.props.id === id)
    )
    &&
    (
        (typeof currentElement === 'string' && insertingTextIndex >= currentTextIndex && insertingTextIndex <= currentTextIndex + currentElement.length) ||
        (isValidElement(currentElement) && insertingTextIndex === currentTextIndex)
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

// TO DO: WE ARE NOT TAKING ARRAY INTO ACCOUNT
export function addElements(elements, content, insertingTextIndex, shouldInsert) {
    if (Array.isArray(elements) && elements.length === 0)
        return [content];

    if (isValidElement(elements))
        elements = [elements];

    const totalLength = countCharacters(elements);
    let contentLength = countCharacters(content);

    if (insertingTextIndex < 0)
        insertingTextIndex = totalLength + insertingTextIndex;
    else if (insertingTextIndex == null)
        insertingTextIndex = totalLength;

    let currentTextIndex = 0;

    if (content?.props?.id === 'cursor')
        contentLength = 0;

    const _addElements = (_elements, _parent = null, _depth = 0) => {
        if (!Array.isArray(_elements))
            _elements = [_elements];

        const newElements = [];

        _elements.map((currentElement, currentElementIndex) => {
            const _shouldInsert = (position) => shouldInsert({
                elements: _elements,
                parent: _parent,
                depth: _depth,

                currentElement,
                currentElementIndex,
                insertingTextIndex,
                currentTextIndex,
                totalLength,
                content,
                contentLength,
                position
            });

            if (typeof currentElement === 'string') {
                if (_shouldInsert()) {
                    const firstSlice = currentElement.slice(0, insertingTextIndex - currentTextIndex);
                    const lastSlice = currentElement.slice(insertingTextIndex - currentTextIndex);

                    if (typeof content === 'string') {
                        newElements.push(`${firstSlice}${content}${lastSlice}`);
                    } else if (isValidElement(content) || Array.isArray(content)) {
                        if (firstSlice) newElements.push(firstSlice);
                        newElements.push(content);
                        if (lastSlice) newElements.push(lastSlice);
                    }

                    currentTextIndex += contentLength;
                } else {
                    newElements.push(currentElement);
                }

                currentTextIndex += currentElement.length;
            } else if (Array.isArray(currentElement)) {
                if (_shouldInsert("before")) {
                    newElements.push(content);
                    currentTextIndex += contentLength;
                }

                newElements.push(_addElements(currentElement, _parent, _depth + 1));

                if (_shouldInsert("after")) {
                    newElements.push(content);
                    currentTextIndex += contentLength;
                }
            } else if (isValidElement(currentElement)) {
                if (_shouldInsert("before")) {
                    newElements.push(content);
                    currentTextIndex += contentLength;
                }

                if (currentElement.type === 'br')
                    currentTextIndex += 1;

                if (currentElement.props.children) {
                    const id = currentElement.props.id ?? uuidv4();
                    newElements.push(
                        cloneElement(
                            currentElement,
                            { id, key: id },
                            _addElements(currentElement.props.children, currentElement, _depth + 1)
                        )
                    );
                } else {
                    newElements.push(currentElement);
                }

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

    const result = _addElements(elements);

    if (!Array.isArray(elements)) {
        if (result.length === 1)
            return result[0];
        else if (result.length === 0)
            return null;
    }
    return result;
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
            if (
                _currentIndex + child.length <= startIndex ||
                !endIndex ||
                _currentIndex >= endIndex
            ) {
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

    const result = _removeElements(elements);
    if (!Array.isArray(elements)) {
        if (result.length === 1)
            return result[0];
        else if (result.length === 0)
            return null;
    }
    return result;
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