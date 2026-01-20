import { createClient, type Client } from '@libsql/client';

let client: Client | null = null;

function getClient(): Client {
    if (!client) {
        const url = process.env.TURSO_DATABASE_URL;
        const authToken = process.env.TURSO_AUTH_TOKEN;

        if (!url || !authToken) {
            throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
        }

        client = createClient({ url, authToken });
    }
    return client;
}

// Export a Proxy that lazily initializes the client on first method call
export default new Proxy({} as Client, {
    get(target, prop) {
        const actualClient = getClient();
        const value = actualClient[prop as keyof Client];
        return typeof value === 'function' ? value.bind(actualClient) : value;
    }
});
