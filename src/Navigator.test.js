import Component from './Layout/Component';
import ComponentNavigator from './ComponentNavigator';

let component;
let navigator;

const route = 'main/users/User';

beforeEach(() => {
  component = new Component('A');
  navigator = new ComponentNavigator('B', component);
});

test('name', () => {
  expect(navigator.name).toBe('B');
});

test('getRouteSegments', () => {
  expect(navigator.getRouteSegments(route)).toEqual(['main', 'users', 'User']);
});

test('getRouteNavigator', () => {
  expect(navigator.getRouteNavigator(route)).toBe('main');
});

test('getRouteNext', () => {
  expect(navigator.getRouteNext(route)).toBe('users/User');
});

test('getRouteComponentId', () => {
  expect(navigator.getRouteComponentId(route)).toBe('User');
});
