import { Navigation } from 'react-native-navigation';

import _set from 'lodash.set';
import _pick from 'lodash.pick';
import _isObject from 'lodash.isplainobject';
import _mapValues from 'lodash.mapvalues';

import {
  ModalNavigator,
  Navigator,
  OverlayNavigator,
  WidgetComponent,
} from './wix';

import BottomTabNavigator from './BottomTabNavigator';
import DrawerNavigator from './DrawerNavigator';
import RootNavigator from './RootNavigator';
import StackNavigator from './StackNavigator';
import SwitchNavigator from './SwitchNavigator';

import { createComponent, createRoutes, getRouteDepth } from './utils';

export { default as registerComponents } from './registerComponents';

const o = {
  assign: Object.assign,
  values: Object.values,
};

export function createBottomTabNavigator(
  routeConfigs,
  options = {},
  config = {},
) {
  const routes = createRoutes(toWixRoutes(routeConfigs));

  const invalid = o
    .values(routes)
    .some(route => !(route instanceof StackNavigator));

  if (invalid) {
    throw new Error(
      '`BottomTabNavigator` only accepts `StackNavigator` children',
    );
  }

  return new BottomTabNavigator(
    routes,
    toWixOptions(options),
    toBottomTabConfig(config),
  );
}

export function createDrawerNavigator(routeConfigs, config = {}) {
  const routes = createRoutes(toWixRoutes(routeConfigs));

  if (config.contentOptions) {
    config.contentOptions = toWixOptions(config.contentOptions);
  }

  const { contentComponent, contentOptions = {} } = config;

  if (!contentComponent) {
    throw new Error('config.contentComponent is required');
  }

  // TODO
  config.drawer = createComponent(contentComponent, contentOptions);

  return new DrawerNavigator(
    routes,
    toWixOptions(options),
    toDrawerConfig(config),
  );
}

export function createRootNavigator(routes) {
  const app = _mapValues(routes, (route, id) => {
    const depth = getRouteDepth(route);
    const { options = {}, config = {}, ...routeConfigs } = route;

    config.parentId = id;

    if (depth === 2) {
      return createBottomTabNavigator(
        createStackNavigators(routeConfigs, id),
        options,
        config,
      );
    }

    if (depth === 1) {
      return createStackNavigator(routeConfigs, toWixOptions(options), config);
    }

    throw new Error('Invalid routes obj');
  });

  return new RootNavigator(app);
}

function createStackNavigators(routes, parentId) {
  return _mapValues(routes, (route, id) => {
    const { options = {}, config = {}, ...routeConfigs } = route;

    config.parentId = `${parentId}/${id}`;

    return createStackNavigator(routeConfigs, options, config);
  });
}

export function createStackNavigator(routeConfigs, options = {}, config = {}) {
  const routes = createRoutes(toWixRoutes(routeConfigs));

  if (config.mode === 'overlay') {
    if (o.values(routes).length > 1) {
      throw new Error('`OverlayNavigator` only accepts one `Component` child');
    }

    return new OverlayNavigator(
      o.values(routes).pop(),
      toWixOptions(options),
      toStackConfig(config),
    );
  }

  const invalid = o.values(routes).some(route => route instanceof Navigator);

  if (invalid) {
    throw new Error(
      `\`${
        config.mode === 'modal' ? 'ModalNavigator' : 'StackNavigator'
      }\` only accepts \`Component\` children`,
    );
  }

  if (config.mode === 'modal') {
    return new ModalNavigator(routes, toWixOptions(options), config);
  }

  return new StackNavigator(routes, toWixOptions(options), config);
}

// TODO
// https://reactnavigation.org/docs/en/switch-navigator.html
export function createSwitchNavigator(routeConfigs, options = {}, config = {}) {
  const routes = createRoutes(toWixRoutes(routeConfigs));

  return new SwitchNavigator(
    routes,
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

function toWixOptions({
  // headerMode,

  // https://reactnavigation.org/docs/stack-navigator/#options
  title,
  header,
  headerShown,
  headerTitle,
  headerTitleAlign,
  // headerTitleAllowFontScaling,
  // headerBackAllowFontScaling,
  // headerBackImage,
  headerBackTitle,
  headerBackTitleVisible,
  // headerTruncatedBackTitle,
  // headerRight,
  // headerLeft,
  headerStyle,
  headerTitleStyle,
  headerBackTitleStyle,
  // headerLeftContainerStyle,
  // headerRightContainerStyle,
  // headerTitleContainerStyle,
  headerTintColor,
  // headerPressColorAndroid,
  headerTransparent,
  headerBackground,
  // headerStatusBarHeight,
  // cardShadowEnabled,
  // cardOverlayEnabled,
  // cardOverlay,
  // cardStyle,
  // animationEnabled,
  // animationTypeForReplace,
  // gestureEnabled,
  // gestureResponseDistance,
  // gestureVelocityImpact,
  // gestureDirection,
  // transitionSpec,
  // cardStyleInterpolator,
  // headerStyleInterpolator,
  // safeAreaInsets,

  // https://reactnavigation.org/docs/drawer-navigator#options
  // drawerLabel,
  // drawerIcon,
  // swipeEnabled,
  // unmountOnBlur,

  // https://reactnavigation.org/docs/bottom-tab-navigator#options
  tabBarVisible,
  tabBarIcon,
  tabBarLabel,
  // tabBarButton,
  // tabBarAccessibilityLabel,
  // tabBarTestID,

  // https://reactnavigation.org/docs/bottom-tab-navigator#props
  // tabBar,
  tabBarOptions,
  ...options
}) {
  if (header === null || headerShown === false) {
    _set(options, 'topBar.visible', false);
    _set(options, 'topBar.drawBehind', true);
  } else {
    if (title) {
      _set(options, 'topBar.title.text', title);
    }

    if (headerTitle) {
      _set(options, 'topBar.title.component.name', headerTitle);
    }

    if (headerTitleAlign) {
      _set(options, 'topBar.title.component.alignment', headerTitleAlign);
    }

    if (headerBackTitle) {
      _set(options, 'topBar.backButton.title', headerBackTitle);
    }

    if (headerBackTitleVisible === false) {
      _set(options, 'topBar.backButton.showTitle', false);
    }

    if (headerStyle) {
      if (headerStyle.backgroundColor) {
        _set(options, 'topBar.background.color', headerStyle.backgroundColor);
      }
    }

    if (headerTitleStyle) {
      if (headerTitleStyle.color) {
        _set(options, 'topBar.title.color', headerTitleStyle.color);
      }
      if (headerTitleStyle.fontFamily) {
        _set(options, 'topBar.title.fontFamily', headerTitleStyle.fontFamily);
      }
      if (headerTitleStyle.fontSize) {
        _set(options, 'topBar.title.fontSize', headerTitleStyle.fontSize);
      }
      if (headerTitleStyle.fontWeight) {
        _set(options, 'topBar.title.fontWeight', headerTitleStyle.fontWeight);
      }
    }

    if (headerBackTitleStyle) {
      if (headerBackTitleStyle.color) {
        _set(options, 'topBar.backButton.color', headerBackTitleStyle.color);
      }
    }

    if (headerTransparent) {
      _set(options, 'topBar.drawBehind', true);
    }

    if (headerBackground) {
      _set(options, 'topBar.background.component.name', headerBackground);
    }

    if (headerTintColor) {
      _set(options, 'topBar.title.color', headerTintColor);
      _set(options, 'topBar.backButton.color', headerTintColor);
    }
  }

  // https://reactnavigation.org/docs/bottom-tab-navigator#tabbaroptions
  if (tabBarOptions) {
    if (tabBarOptions.activeTintColor) {
      _set(
        options,
        'bottomTab.selectedTextColor',
        tabBarOptions.activeTintColor,
      );
      _set(
        options,
        'bottomTab.selectedIconColor',
        tabBarOptions.activeTintColor,
      );
    }

    if (tabBarOptions.inactiveTintColor) {
      _set(options, 'bottomTab.textColor', tabBarOptions.inactiveTintColor);
      _set(options, 'bottomTab.iconColor', tabBarOptions.inactiveTintColor);
    }

    if (tabBarOptions.inactiveBackgroundColor) {
      _set(
        options,
        'bottomTabs.backgroundColor',
        tabBarOptions.inactiveBackgroundColor,
      );
    }
  }

  if (tabBarVisible === false) {
    _set(options, 'bottomTabs.visible', false);
  }

  if (tabBarIcon) {
    _set(options, 'bottomTab.icon', tabBarIcon);
  }

  if (tabBarLabel) {
    _set(options, 'bottomTab.text', tabBarLabel);
  }

  // tabBarButton,

  return options;
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

function toWixRoutes(routes) {
  return _mapValues(routes, route => {
    if (_isObject(route)) {
      return toWixOptions(route);
    }

    return route;
  });
}
