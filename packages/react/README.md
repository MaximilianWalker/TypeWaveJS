
<h1 align="center">
  TypeWave JS React
</h1>

<h2 align="center" style="padding-bottom: 30px">
  <a href="#introduction">Introduction</a> •
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#author">Author</a> •
  <a href="#license">License</a>
</h2>

<p align="center">
  <img alt="NPM Version" src="https://img.shields.io/npm/v/%40typewavejs%2Freact?style=for-the-badge">
  <img alt="NPM Downloads" src="https://img.shields.io/npm/dm/%40typewavejs%2Freact?style=for-the-badge">
  <img alt="NPM License" src="https://img.shields.io/npm/l/%40typewavejs%2Freact?style=for-the-badge">
</p>

## Introduction

The `TypeWave JS` library is a versatile and advanced tool designed for creating interactive typing animations within React applications. With its support for a broad spectrum of animation events, `TypeWave JS` enables developers to craft everything from simple typing effects to complex animated sequences. This includes controlling typing speed, cursor movements, text deletions, pauses within sequences, continuous loops, and dynamic configuration changes during an animation. Additionally, its ability to handle React elements instead of just strings allows for rich, dynamic content integration, making it an ideal choice for any animation scenario in modern web applications. 

## Features

- **Dynamic Typing**: Simulates typing with adjustable speed, cursor movements, and deletions.
- **Customizable Cursor**: Options to show or hide the cursor and customize its character.
- **Event Control**: Manipulates typing behavior through a structured event system.
- **Animation Control**: Offers fine control over each stage of the animation, including pauses and loops.
- **Versatility**: Accepts React elements as inputs, allowing for a wide range of use cases.

## Installation

To integrate the `TypeWave JS` library into your project, install it as follows:

```bash
npm install @typewavejs/react
```

## How To Use

Here is an example demonstrating how to use the `TypeWave JS` library:

```jsx
import { TypeWave } from 'TypeWaveJS';

<TypeWaveJS
  play={true}
  events={[
    {
      type: 'type', 
      value: 'Hello, world!'
    }
  ]}
  showCursor={true}
  cursorCharacter="|"
  typeSpeed={100}
  moveSpeed={100}
  deleteSpeed={100}
  onEvent={(event, index) => console.log(`Event ${index}:`, event)}
/>
```

## Documentation

### Props Overview

The `TypeWave JS` library offers a robust set of properties (props) that allow developers to customize and control the behavior of typing animations within their React applications:

| Prop                | Type          | Default  | Description                                                                                  |
| ------------------- | ------------- | -------- | -------------------------------------------------------------------------------------------- |
| **play**            | `boolean`     | `true`   | Controls whether the animation should play automatically.                                    |
| **events**          | `array`       | Required | An array of event objects that dictate the sequence and type of animations performed.        |
| **component**       | `elementType` | `span`    | Specifies the type of React component or HTML element that should wrap the animated content. |
| **showCursor**      | `boolean`     | `true`   | Determines whether to show a blinking cursor during the typing animation.                    |
| **cursorCharacter** | `string`      | `\|`     | The character used to represent the cursor.                                                  |
| **typeSpeed**       | `number`      | `250`    | The speed in milliseconds at which typing occurs.                                            |
| **moveSpeed**       | `number`      | `250`    | The speed in milliseconds at which the cursor moves.                                         |
| **deleteSpeed**     | `number`      | `250`    | The speed in milliseconds at which characters are deleted during the animation.              |
| **onEvent**         | `func`        | `null`   | A callback function that is executed after each event is processed.                          |


### Event Configuration

Events in `TypeWave JS` are defined as objects within the `events` array prop, each detailing specific actions in the animation sequence. The structure of these events allows for a wide variety of animations:

- **type** (`string`): Describes the animation event type with supported values such as `type`, `move`, `delete`, `pause`, `loop`, and `options`. Each type dictates the behavior of the animation:
  - `type`: Inserts the specified content (text or React elements) at the current cursor position.
  - `move`: Shifts the cursor a specified number of positions.
  - `delete`: Removes content starting from the current cursor position.
  - `pause`: Halts the animation for a specified duration.
  - `loop`: Repeats the animation sequence from the start.
  - `options`: Dynamically changes settings such as cursor character and typing speed during the animation.
- **value** (`any`): The value associated with the event, which varies based on the event type (e.g., text/element for `type`, number of positions for `move`).
- **delay** (`number`): Optional delay before the event starts, useful for timing adjustments between events.
- **instant** (`boolean`): When set to `true`, the event is executed immediately without any animated delay.
- **remove** (`boolean`): When set to `true`, the event is removed from the animation queue once executed.

These event configurations enable precise control over each aspect of the typing animation, allowing developers to create complex and visually engaging interactions.

## Author
**[Diogo Marques Crava](https://diogocrava.dev)**

- Website: [diogocrava.dev](https://diogocrava.dev)
- GitHub: [@MaximilianWalker](https://github.com/MaximilianWalker)
- LinkedIn: [Diogo Crava](https://www.linkedin.com/in/diogo-crava/)

Feel free to contact me through any of the above platforms!

## License

`TypeWave JS` is released under the MIT license. Feel free to use it in your projects, abiding by the terms of the license.
