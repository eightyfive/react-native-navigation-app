import { Navigation } from 'react-native-navigation';

import _pick from 'lodash.pick';
import _isObject from 'lodash.isplainobject';
import _mapValues from 'lodash.mapvalues';

import BottomTabsNavigator from './BottomTabsNavigator';
import ModalNavigator from './ModalNavigator';
import OverlayNavigator from './OverlayNavigator';
import RootNavigator from './RootNavigator';
import Router from './Router';
import SideMenuNavigator from './SideMenuNavigator';
import StackNavigator from './StackNavigator';
import SwitchNavigator from './SwitchNavigator';
import WidgetComponent from './WidgetComponent';

import {
  createComponents,
  createComponent,
  getRouteDepth,
  toWixOptions,
} from './utils';

export { default as registerComponents } from './registerComponents';

const o = Object;

export function createBottomTabsNavigator(tabs, options = {}, config = {}) {
  const stacks = _mapValues(tabs, (tab, tabId) => {
    const {
      options: stackOptions = {},
      config: stackConfig = {},
      ...screens
    } = tab;

    stackConfig.parentId = config.parentId
      ? `${config.parentId}/${tabId}`
      : tabId;

    return createStackNavigator(
      screens,
      o.assign({}, toWixOptions(stackOptions || {})),
      stackConfig,
    );
  });

  return new BottomTabsNavigator(
    stacks,
    toWixOptions(options),
    toBottomTabConfig(config),
  );
}

export function createDrawerNavigator(screens, config = {}) {
  const routes = createComponents(screens);

  if (config.contentOptions) {
    config.contentOptions = toWixOptions(config.contentOptions);
  }

  const { contentComponent, contentOptions = {} } = config;

  if (!contentComponent) {
    throw new Error('config.contentComponent is required');
  }

  // TODO
  config.drawer = createComponent(contentComponent, contentOptions);

  return new SideMenuNavigator(
    routes,
    toWixOptions(options),
    toDrawerConfig(config),
  );
}

export function createRootNavigator(routes) {
  return new RootNavigator(createRoutes(routes));
}

export function createRouter(routes, services = {}) {
  const screens = findScreens(routes, new Map());

  return new Router(createRoutes(routes), screens, services);
}

function findScreens(routes, screens, parentId = null) {
  for (const [key, route] of o.entries(routes)) {
    if (key === 'options' || key === 'config') {
      continue;
    }

    const id = parentId ? `${parentId}/${key}` : key;

    if (_isObject(route)) {
      findScreens(route, screens, id);
    } else {
      screens.set(id, route);
    }
  }

  return screens;
}

export function createStackNavigator(screens, options = {}, config = {}) {
  const components = createComponents(screens);

  if (config.mode === 'modal') {
    return new ModalNavigator(
      components,
      toWixOptions(options),
      toStackConfig(config),
    );
  }

  return new StackNavigator(
    components,
    toWixOptions(options),
    toStackConfig(config),
  );
}

// TODO
// https://reactnavigation.org/docs/en/switch-navigator.html
export function createSwitchNavigator(routes, options = {}, config = {}) {
  return new SwitchNavigator(
    createRoutes(routes),
    toWixOptions(options),
    toSwitchConfig(config),
  );
}

export function createWidget(id) {
  return new WidgetComponent(id);
}

export function setDefaultOptions({ options, ...rest }) {
  const defaultOptions = toWixOptions(rest, options);

  Navigation.events().registerAppLaunchedListener(() =>
    Navigation.setDefaultOptions(defaultOptions),
  );
}

// https://reactnavigation.org/docs/en/stack-navigator.html#stacknavigatorconfig
function toStackConfig(config) {
  return toConfig(config, [
    'initialRouteParams',
    'screenOptions',
    'keyboardHandlingEnabled',
    'mode',
    'headerMode',
  ]);
}

// https://reactnavigation.org/docs/en/bottom-tab-navigator.html#bottomtabnavigatorconfig
function toBottomTabConfig(config) {
  return toConfig(config, [
    'screenOptions',
    'backBehavior',
    'lazy',
    'tabBar',
    'tabBarOptions',
  ]);
}

// https://reactnavigation.org/docs/en/drawer-navigator.html#drawernavigatorconfig
function toDrawerConfig(config) {
  return toConfig(config, [
    'screenOptions',
    'backBehavior',
    'drawerPosition',
    'drawerType',
    'edgeWidth',
    'hideStatusBar',
    'statusBarAnimation',
    'keyboardDismissMode',
    'minSwipeDistance',
    'overlayColor',
    'gestureHandlerProps',
    'lazy',
    'sceneContainerStyle',
    'drawerStyle',
    'drawerContent',
    'drawerContentOptions',
  ]);
}

// https://reactnavigation.org/docs/en/switch-navigator.html#switchnavigatorconfig
function toSwitchConfig(config) {
  return toConfig(config, ['resetOnBlur', 'backBehavior']);
}

const configKeys = ['initialRouteName', 'parentId'];

function toConfig({ screenOptions, ...rest }, keys) {
  const config = _pick(rest, configKeys.concat(keys));

  if (screenOptions) {
    config.screenOptions = toWixOptions(screenOptions);
  }

  return config;
}

function createRoutes(routes) {
  return _mapValues(routes, (route, id) => {
    const isOverlay = !_isObject(route);

    if (isOverlay) {
      return new OverlayNavigator(createComponent(id, route));
    }

    const { options = {}, config = {}, ...screens } = route;
    const depth = getRouteDepth(route);

    config.parentId = id;

    if (depth === 1) {
      return createBottomTabNavigator(screens, options, config);
    }

    if (depth === 0) {
      return createStackNavigator(screens, toWixOptions(options), config);
    }

    throw new Error('Invalid routes obj');
  });
}
