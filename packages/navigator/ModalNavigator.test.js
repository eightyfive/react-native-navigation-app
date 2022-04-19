import { Navigation } from 'react-native-navigation';

import {
  createComponents,
  createComponentLayout,
  createStackLayout,
} from './test-utils';
import { Stack } from './Layouts/Stack';
import ModalNavigator from './ModalNavigator';

let app;

const props = { foo: 'bar' };

describe('ModalNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Stack.layoutIndex = 0;

    const components = createComponents();

    app = new ModalNavigator(components);
    app.mount();
  });

  test('show', () => {
    app.show(props);

    expect(Navigation.showModal).toHaveBeenCalledWith({
      stack: createStackLayout(0, [
        createComponentLayout('a', 'A', {
          topBar: {
            title: { text: 'Title A' },
          },
        }),
      ]),
    });
  });

  test('dismiss', () => {
    app.dismiss();

    expect(Navigation.dismissModal).toHaveBeenCalledWith(app.id);
  });
});
