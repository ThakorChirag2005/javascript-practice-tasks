const BASE_URL = "https://jsonplaceholder.typicode.com";

export async function getUsers() {
    const response = await fetch(`${BASE_URL}/users`);

    if (!response.ok) {
        throw new Error(`Users request failed: ${response.status}`);
    }

    return await response.json();
}

export async function getPosts() {
    const response = await fetch(`${BASE_URL}/posts`);

    if (!response.ok) {
        throw new Error(`Posts request failed: ${response.status}`);
    }

    return await response.json();
}