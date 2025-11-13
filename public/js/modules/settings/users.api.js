// public/js/modules/settings/users.api.js

import { api } from '../../utils/apiFetch.js';

export async function addAccountHolder(name) {
  return api.post('/api/holders', { username: name });
}

export async function getAccountHolders() {
  return api.get('/api/holders');
}
