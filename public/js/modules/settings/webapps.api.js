// public/js/modules/settings/webapps.api.js

import { api } from '../../services/apiFetch.js';

export async function getWebApps() {
  return api.get('/api/webapps');
}

export async function addWebApp(name) {
  return api.post('/api/webapps', { name });
}

export async function deleteWebApp(id) {
  return api.delete(`/api/webapps/${id}`);
}
