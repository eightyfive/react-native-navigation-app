import { Component, BottomTabs, Modal, Overlay, Stack } from './Layouts';
import Navigator from './Navigator';

export default class SwitchNavigator extends Navigator {
  constructor(layouts, config = {}) {
    super(layouts, config);

    const notAllowed = Array.from(this.layouts.values()).some(
      layout => layout instanceof Modal || layout instanceof Overlay,
    );

    if (notAllowed.length) {
      throw new TypeError('Invalid argument');
    }

    this.layoutName = null;

    this.addListener('AppLaunched', this.handleAppLaunched);
  }

  handleAppLaunched = () => this.remount();

  get layout() {
    if (this.layoutName) {
      return this.layouts.get(this.layoutName);
    }

    return null;
  }

  remount() {
    this.layout.mount();
  }

  render(componentId, props) {
    const [name, childName] = this.readPath(componentId);

    if (this.layoutName !== name) {
      // Unmount old layout
      if (this.layout) {
        this.layout.unmount();
      }

      this.layoutName = name;

      // Mount new layout
      this.layout.mount(props);
    } else if (this.layout instanceof Component) {
      this.layout.update(props);
    }

    if (childName) {
      if (this.layout instanceof BottomTabs) {
        this.renderBottomTabs(this.layout, childName, props);
      }

      if (this.layout instanceof Stack) {
        this.renderStack(this.layout, childName, props);
      }
    }
  }

  goBack() {
    if (this.layout instanceof BottomTabs) {
      this.goBackBottomTabs(this.layout);
    }

    if (this.layout instanceof Stack) {
      this.goBackStack(this.layout);
    }
  }
}
