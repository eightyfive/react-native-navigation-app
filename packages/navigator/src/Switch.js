import Navigable from './Navigable';

export default class Switch extends Navigable {
  constructor(navigators) {
    this.navigators = new Map(Object.entries(navigators));
    this.name = null;
  }

  get navigator() {
    if (!this.name) {
      throw new Error('No navigator mounted');
    }

    return this.navigators.get(this.name);
  }

  mount(name, props) {
    if (!this.navigators.has(name)) {
      throw new Error(`Navigator not found: ${name}`);
    }

    this.navigators.get(name).mount(props);

    this.name = name;
  }

  push(name, props) {
    this.navigator.push(name, props);
  }

  pop() {
    this.navigator.pop();
  }
}
