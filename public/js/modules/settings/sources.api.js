// public/js/modules/settings/sources.api.js

import { api } from '../../utils/apiFetch.js';

export async function getSources() {
  return api.get('/api/sources');
}

export async function addSource(source) {
  return api.post('/api/sources', source);
}

export async function deleteSource(id) {
  return api.delete(`/api/sources/${id}`);
}

export async function updateSource(id, source) {
  return api.put(`/api/sources/${id}`, source);
}
