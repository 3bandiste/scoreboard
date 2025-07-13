// Script pour forcer les mises à jour de l'application
window.updateHelper = {
    version: '3.0',

    // Vérifier si une nouvelle version est disponible
    checkForUpdate: function () {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'CHECK_VERSION',
                version: this.version
            });
        }
    },

    // Forcer la mise à jour de l'application
    forceUpdate: function () {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function (registrations) {
                registrations.forEach(function (registration) {
                    registration.unregister();
                });
            }).then(function () {
                // Vider tous les caches
                if ('caches' in window) {
                    caches.keys().then(function (cacheNames) {
                        return Promise.all(
                            cacheNames.map(function (cacheName) {
                                return caches.delete(cacheName);
                            })
                        );
                    }).then(function () {
                        // Forcer le rechargement complet
                        window.location.reload(true);
                    });
                } else {
                    // Fallback si les caches ne sont pas supportés
                    window.location.reload(true);
                }
            });
        } else {
            // Fallback si les service workers ne sont pas supportés
            window.location.reload(true);
        }
    },

    // Vider le cache et recharger
    clearCacheAndReload: function () {
        console.log('Vidage du cache et rechargement...');
        this.forceUpdate();
    }
};

// Ajouter des paramètres URL pour forcer le rechargement
window.addEventListener('load', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const forceUpdate = urlParams.get('update');

    if (forceUpdate === 'true') {
        console.log('Mise à jour forcée détectée');
        window.updateHelper.forceUpdate();
    }
});

// Détecter les mises à jour automatiquement
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', function () {
        console.log('Nouvelle version détectée, rechargement...');
        window.location.reload();
    });
}