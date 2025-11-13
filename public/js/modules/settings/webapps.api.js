// public/js/modules/settings/webapps.api.js

export async function getWebApps() {
    const response = await fetch('/api/webapps');
    if (!response.ok) {
        throw new Error('Failed to fetch web apps');
    }
    return response.json();
}

export async function addWebApp(name) {
    const response = await fetch('/api/webapps', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) {
        throw new Error('Failed to add web app');
    }
    return response.json();
}

export async function deleteWebApp(id) {
    const response = await fetch(`/api/webapps/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete web app');
    }
    return response.json();
}