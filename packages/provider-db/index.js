import { ServiceProvider } from 'rnna';

import createDb from './db';

export default class DbProvider extends ServiceProvider {
  register(container) {
    container.service('db', createDb, 'db.selectors');
  }

  boot(services, store) {
    services.db.setStore(store);
  }
}
