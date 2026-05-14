import { OpenAPISchemaDefinition } from "@/types";

const DB_APP = 'glpi';
/**
 * Name of the table to store OpenAPI schema components.
 * Each entry will have the schema name as the key and the schema definition as the value.
 */
const TABLE_OPENAPISCHEMA_COMPONENTS = 'openapi_components';

export function useIndexedDB() {
    function openDatabase(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_APP, 1);

            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(TABLE_OPENAPISCHEMA_COMPONENTS)) {
                    db.createObjectStore(TABLE_OPENAPISCHEMA_COMPONENTS, { keyPath: 'name' });
                }
            };

            request.onsuccess = (event) => {
                resolve((event.target as IDBOpenDBRequest).result);
            };

            request.onerror = (event) => {
                reject((event.target as IDBOpenDBRequest).error);
            };
        });
    }

    function saveOpenAPIComponenets(components: Record<string, OpenAPISchemaDefinition>): Promise<void> {
        return openDatabase().then(db => {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([TABLE_OPENAPISCHEMA_COMPONENTS], 'readwrite');
                const store = transaction.objectStore(TABLE_OPENAPISCHEMA_COMPONENTS);

                for (const [name, schema] of Object.entries(components)) {
                    store.put({name, schema});
                }

                transaction.oncomplete = () => resolve();
                transaction.onerror = (event) => reject((event.target as IDBTransaction).error);
            });
        });
    }

    function getOpenAPIComponents(): Promise<Record<string, OpenAPISchemaDefinition>> {
        return openDatabase().then(db => {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([TABLE_OPENAPISCHEMA_COMPONENTS], 'readonly');
                const store = transaction.objectStore(TABLE_OPENAPISCHEMA_COMPONENTS);
                const request = store.getAll();

                request.onsuccess = (event) => {
                    const result = (event.target as IDBRequest).result;
                    const components: Record<string, any> = {};
                    result.forEach((entry: {name: string, schema: any}) => {
                        components[entry.name] = entry.schema;
                    });
                    resolve(components);
                };

                request.onerror = (event) => {
                    reject((event.target as IDBRequest).error);
                };
            });
        });
    }

    function getOpenAPIComponent(name: string): Promise<OpenAPISchemaDefinition> {
        return openDatabase().then(db => {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([TABLE_OPENAPISCHEMA_COMPONENTS], 'readonly');
                const store = transaction.objectStore(TABLE_OPENAPISCHEMA_COMPONENTS);
                const request = store.get(name);

                request.onsuccess = (event) => {
                    const result = (event.target as IDBRequest).result;
                    resolve(result ? result.schema : null);
                };

                request.onerror = (event) => {
                    reject((event.target as IDBRequest).error);
                };
            });
        });
    }

    function getAllOpenAPIComponentNames(): Promise<string[]> {
        return openDatabase().then(db => {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([TABLE_OPENAPISCHEMA_COMPONENTS], 'readonly');
                const store = transaction.objectStore(TABLE_OPENAPISCHEMA_COMPONENTS);
                const request = store.getAllKeys();

                request.onsuccess = (event) => {
                    resolve((event.target as IDBRequest).result as string[]);
                };

                request.onerror = (event) => {
                    reject((event.target as IDBRequest).error);
                };
            });
        });
    }

    function getOpenAPISchemaNameForGLPIItemtype(itemtype: string): Promise<string | null> {
        return openDatabase().then(db => {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([TABLE_OPENAPISCHEMA_COMPONENTS], 'readonly');
                const store = transaction.objectStore(TABLE_OPENAPISCHEMA_COMPONENTS);

                // check all components for a schema with a 'x-itemtype' property matching the given itemtype
                const request = store.getAll();

                request.onsuccess = (event) => {
                    const result = (event.target as IDBRequest).result;
                    for (const entry of result) {
                        if (entry.schema['x-itemtype'] === itemtype) {
                            resolve(entry.name);
                            return;
                        }
                    }
                    resolve(null); // not found
                };

                request.onerror = (event) => {
                    reject((event.target as IDBRequest).error);
                };
            });
        });
    }

    function clearAllStores(): Promise<void> {
        return openDatabase().then(db => {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([TABLE_OPENAPISCHEMA_COMPONENTS], 'readwrite');
                const store = transaction.objectStore(TABLE_OPENAPISCHEMA_COMPONENTS);
                const request = store.clear();

                request.onsuccess = () => resolve();
                request.onerror = (event) => reject((event.target as IDBRequest).error);
            });
        });
    }

    return {
        openDatabase,
        saveOpenAPIComponenets,
        getOpenAPIComponents,
        getOpenAPIComponent,
        getAllOpenAPIComponentNames,
        getOpenAPISchemaNameForGLPIItemtype,
        clearAllStores
    }
}