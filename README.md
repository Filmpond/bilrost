# Bilrost

The Bilrost is a Javascript library which can be used to send and receive messages through the Azure message bus
using a publish subcribe pattern. It leverages the power of topics and subscribers as provided by the Azure message
bus and Azure Javascript SDK. In addition it also provides a "worker" style approach to authoring multiple subscribers.

The Bilrost can only be used in an ES6 environment.

## Installation

Add the following dependency to your package.json file of your project via npm;

```
npm install bilrost --save
```

## Usage

This library consists of 2 primary objects; Message and Worker. A message is an object which can be published to a Topic.
Topics in the Bilrost are represented as simple strings. This library does not support the definition of Topics and
Subscribers. To define either Topics or Subscribers please use the Azure portal, CLI or SDK instead. Workers subscribe to
messages sent to a particular Topic and Subscriber. When a message is received the worker invokes a callback function
provided to the Worker at initialisation.

The design of this library leverages the architecture of the fan out pub/sub model, i.e. a topic can have 1 or more subscribers,
each subscriber registers their interest in receiving messages posted to the topic. For more information on service
bus and how it works please refer to this [article](https://azure.microsoft.com/en-us/documentation/articles/service-bus-fundamentals-hybrid-solutions/#service-bus-fundamentals).

### Configuration

To begin using this library we need to set some environment variables;

* AZURE_SERVICEBUS_CONNECTION_STRING
  * This variable is mandatory and must be set in order for this library to communicate with the Azure message bus. For more information on how to obtain these values for your service bus please refer to this [article](https://azure.microsoft.com/en-us/documentation/articles/service-bus-authentication-and-authorization/).
* WORKER_SLEEP
  * This variable is optional, it tells the worker how long to sleep for before checking for new jobs. This value is specified in milliseconds. The default is 5000 milliseconds.
* SUBSCRIBER_TIMEOUT
  * This variable is optional, it tells the worker how long to set the timeout when communicating with the message bus. This value is specified in seconds. The default is 30 seconds.

### Examples

To publish a message to topic;

```javascript
var Message = require('bilrost').Message;
var msg = new Message({ data: 'value' });
msg.postTo('topic-name', callback);
```

The message payload can be an object literal. Object literals are serialised and deserialised to and from JSON during transport. The message payload can also be simple primitive types.

To setup a worker which subscribes to a particular topic;

```javascript
var Worker = require('bilrost').Worker;
var worker = new Worker('topic_name', 'subscriber_name', callback);
worker.run();
```

Each worker is provided with a `callback` function. This function is invoked each time it receives a message from the message bus. The `run` function is asynchronous (i.e. non blocking). The `callback` function must return a `Promise`, anything other than a promise returned will result in an unhandled Promise error. A `callback` function must also have the following signature;

```javascript
function callback(message) {}
```

A message has 2 properties `body` and `brokerProperties`. `body` is the original message posted to the bus. Each message has some associated meta data. This meta data is accessible through the `brokerProperties` attribute. The callback function must return a `Promise` as mentioned. A `Promise` which resolves will delete the received message from the Bifrost. This means, the message will not be re-delivered to the recipient. A rejected `Promise` will result in the Bifrost re-delivering the message to the recipient. As mentioned earlier a function which does not return a `Promise` will result in an unhandled promise.

# Is it any good?

We have been [dogfooding](https://en.wikipedia.org/wiki/Eating_your_own_dog_food) this product in our production
environment for the past year with no issues.

# Contributing

We'd love to have you involved. Please read our [contributing guide]() for information on how to get stuck in.

Contributors

This project is managed by the Filmpond team.

These individuals have come up with the ideas and written the code that made this possible:

1. Shirren Premaratne
2. Leslie Fung

# Licence

This program is free software: you can redistribute it and/or modify it under the terms of the MIT License.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the MIT License for more details.

The MIT License (MIT)

Copyright (C) 2016 Filmpond Pty Ltd

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
