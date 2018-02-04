import {expectation} from './utils';

function toHaveBeenCalledWithEvent(jestFunction, expectedEventConstructor) {
  const mockFunction = jestFunction.mock;
  const mockCalls = mockFunction.calls;
  let pass;
  let message;

  pass = !mockCalls.length;
  if (pass) {
    message = () => `Expected ${expectedEventConstructor.type} event ${expectation(pass)} triggered`;
    return {pass, message};
  }

  const event = mockCalls[0][0];

  pass = !event;
  if (pass) {
    message = () => `Expected ${expectedEventConstructor.type} event ${expectation(pass)} triggered with an event instance`;
    return {pass, message};
  }

  pass = (event.constructor === expectedEventConstructor);

  return {
    pass,
    message: () => `Expected ${event.type} event ${expectation(pass)} triggered with ${expectedEventConstructor.name} instance`,
  };
}

function toHaveBeenCalledWithEventProperties(jestFunction, expectedProperties) {
  const mockFunction = jestFunction.mock;
  const mockCalls = mockFunction.calls;
  const event = mockCalls[0][0];
  const expectedPropertiesList = Object.entries(expectedProperties);

  const badMatches = expectedPropertiesList
    .map(([key, value]) => ({key, value}))
    .filter(({key, value}) => event[key] !== value);

  const pass = Boolean(!badMatches.length);

  return {
    pass,
    message: () => {
      const listOfExpectedProperties =
        expectedPropertiesList.map(([key, value]) => `${key}=${value}`);

      return `Expected ${event.type} event ${expectation(pass)} the following properties:\n${listOfExpectedProperties.join('\n')}`;
    },
  };
}

expect.extend({
  toHaveBeenCalledWithEvent,
  toHaveBeenCalledWithEventProperties,
});
