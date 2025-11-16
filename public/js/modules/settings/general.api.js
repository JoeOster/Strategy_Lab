import { api } from '../../services/apiFetch.js';

export async function getSettings() {
  return api.get('/api/settings');
}

export async function updateSettings(settings) {
  return api.put('/api/settings', settings);
}
