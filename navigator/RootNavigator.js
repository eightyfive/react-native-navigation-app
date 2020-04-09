import React from 'react';
import { Navigation } from 'react-native-navigation';

import SwitchNavigator from './SwitchNavigator';
import ModalNavigator from './ModalNavigator';
import OverlayNavigator from './OverlayNavigator';

export default class RootNavigator extends SwitchNavigator {
  constructor(routes, config = {}) {
    super(routes, config);

    this.backBehavior = 'none'; // Force
    this.overlays = [];
    this.fromId = this.initialRouteName;

    this.overlayIds = Object.keys(routes)
      .filter(id => routes[id] instanceof OverlayNavigator)
      .map(id => id);

    this.listeners = {
      _didAppear: [],
      _modalDismiss: [],
    };

    this.addListener('_didAppear', this.handleDidAppear);
    this.addListener('_modalDismiss', this.handleModalDismiss);

    this.listen('ComponentDidAppear', '_didAppear');
    this.listen('ModalDismissed', '_modalDismiss');

    this.launched = new Promise(resolve =>
      this.listenOnce('AppLaunched', resolve),
    );
  }

  handleDidAppear = ({ componentId: id }) => {
    if (this.isScene(id)) {
      this.fromId = id;
    }
  };

  handleModalDismiss = ({ componentId: id, modalsDismissed }) => {
    // Happens when Native back button is pressed.

    if (this.route instanceof ModalNavigator && this.route.id === id) {
      this.history.pop();
    }
  };

  launch() {
    return this.launched;
  }

  remount() {
    this.history.forEach(id => this.get(id).mount());

    this.overlays.forEach(id => this.get(id).mount());
  }

  navigate(path, params) {
    const [id, rest] = this.parsePath(path);
    const route = this.get(id);

    const isOverlay = route instanceof OverlayNavigator;

    if (isOverlay) {
      this.overlays.push(route.id);

      route.mount(params);
      return;
    }

    if (!this.route) {
      this.history = [id];

      route.mount(params);
    } else if (this.route.id !== id) {
      if (this.route instanceof ModalNavigator) {
        // Only one modal at a time
        this.dismissModal();
        this.history.push(id);
      } else {
        // Unmount old route
        this.route.unmount(this.fromId);
        this.history = [id];
      }

      route.mount(params);
    }

    if (rest) {
      this.route.navigate(rest, params, this.fromId);
    }
  }

  goBack() {
    try {
      this.route.goBack(this.fromId);
    } catch (err) {
      if (this.route instanceof ModalNavigator) {
        this.dismissModal();
      }
    }
  }

  dismissModal() {
    if (!(this.route instanceof ModalNavigator)) {
      throw new Error('No modal to dismiss');
    }

    this.route.unmount(this.fromId);
    this.history.pop();
  }

  dismissAllModals() {
    if (this.route instanceof ModalNavigator) {
      Navigation.dismissAllModals();
    }
  }

  onDismissOverlay(componentId) {
    this.overlays = this.overlays.filter(id => id === componentId);
  }

  isScene(id) {
    const isWidget = id.indexOf('widget-') === 0;

    return !isWidget && !this.overlayIds.includes(id);
  }
}
