import { Options } from 'react-native-navigation';

export type Props = Record<string, string | number | boolean>;

export abstract class Layout<LayoutType, RootKey extends string> {
  options: Options;

  constructor(options?: Options) {
    this.options = options || {};
  }

  hasOptions() {
    return Object.keys(this.options).length > 0;
  }

  abstract getLayout(props: Props): LayoutType;

  abstract getRoot(props: Props): Record<RootKey, LayoutType>;
}
