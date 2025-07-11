const CACHE_NAME = 'scoreboard-v2.2';
const urlsToCache = [
    '/',
    '/index.html',
    '/src/main.js',
    '/src/App.vue',
    '/src/components/PlayerScore.vue',
    '/src/components/ReprisesDisplay.vue',
    '/src/components/InstallPrompt.vue',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
    '/logo-voisins-2.png',
    '/favicon.ico',
    '/favicon.png'
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

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - retourner la réponse depuis le cache
                if (response) {
                    return response;
                }

                // Sinon, faire la requête réseau
                return fetch(event.request).then(response => {
                    // Vérifier si on a reçu une réponse valide
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        console.log('Réponse non cachable:', event.request.url, response.status);
                        return response;
                    }

                    // Cloner la réponse
                    const responseToCache = response.clone();

                    // Cacher la réponse de manière asynchrone
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
                // En cas d'erreur, essayer la requête réseau directement
                return fetch(event.request);
            })
    );
});