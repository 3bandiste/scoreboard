const CACHE_NAME = 'scoreboard-v3.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/src/main.js',
    '/src/App.vue',
    '/src/components/PlayerScore.vue',
    '/src/components/PlayerScoreCasin.vue',
    '/src/components/ReprisesDisplay.vue',
    '/src/components/ReprisesDisplayCasin.vue',
    '/src/components/InstallPrompt.vue',
    '/src/components/ModeSelector.vue',
    '/src/components/ReprisesTable.vue',
    '/manifest.json',
    '/favicon-192.png',
    '/favicon-512.png',
    '/logo-voisins-2.png',
    '/favicon.ico',
    '/favicon-16.png',
    '/favicon-32.png',
    '/favicon-48.png'
];

// Fonction pour vérifier si une requête doit être cachée
function shouldCache(request) {
    const url = new URL(request.url);

    // Ne cacher que les requêtes HTTP/HTTPS de notre domaine
    if (!['http:', 'https:'].includes(url.protocol)) {
        return false;
    }

    // Éviter de cacher les extensions Chrome et autres schemes
    if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
        return false;
    }

    // Éviter de cacher les requêtes vers des APIs externes
    if (url.hostname !== location.hostname && url.hostname !== 'localhost') {
        return false;
    }

    return true;
}

// Installation du service worker
self.addEventListener('install', event => {
    console.log('Installation du Service Worker');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache ouvert:', CACHE_NAME);
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Ressources mises en cache avec succès');
                // Activer immédiatement le nouveau service worker
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Erreur lors de l\'installation:', error);
            })
    );
});

// Activation du service worker
self.addEventListener('activate', event => {
    console.log('Activation du Service Worker');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Suppression de l\'ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker activé');
            // Prendre le contrôle de toutes les pages ouvertes
            return self.clients.claim();
        }).catch(error => {
            console.error('Erreur lors de l\'activation:', error);
        })
    );
});

// Interception des requêtes réseau
self.addEventListener('fetch', event => {
    // Ignorer les requêtes qui ne doivent pas être cachées
    if (!shouldCache(event.request)) {
        return; // Laisser passer la requête normalement
    }

    // Stratégie "Network First" pour les fichiers critiques (HTML, JS, CSS)
    const url = new URL(event.request.url);
    const isCritical = url.pathname.endsWith('.html') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.css') ||
        url.pathname === '/';

    if (isCritical) {
        // Network First pour les fichiers critiques
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(event.request, responseToCache))
                            .catch(error => console.warn('Erreur cache:', error));
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback sur le cache si network fail
                    return caches.match(event.request);
                })
        );
    } else {
        // Cache First pour les autres ressources
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        return response;
                    }

                    return fetch(event.request).then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                try {
                                    cache.put(event.request, responseToCache);
                                } catch (error) {
                                    console.warn('Erreur lors de la mise en cache:', event.request.url, error);
                                }
                            })
                            .catch(error => {
                                console.warn('Erreur ouverture cache:', error);
                            });

                        return response;
                    }).catch(error => {
                        console.error('Erreur requête réseau:', event.request.url, error);
                        throw error;
                    });
                })
                .catch(error => {
                    console.error('Erreur cache match:', event.request.url, error);
                    return fetch(event.request);
                })
        );
    }
});

// Écouter les messages pour forcer les mises à jour
self.addEventListener('message', event => {
    if (event.data.type === 'FORCE_UPDATE') {
        console.log('Mise à jour forcée demandée');
        self.skipWaiting();
    }
});