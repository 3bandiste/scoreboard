// Script à exécuter dans la console pour forcer une mise à jour
function forceAppUpdate() {
    console.log('🔄 Forçage de la mise à jour de l\'application...');

    // Méthode 1 : Utiliser le helper si disponible
    if (window.updateHelper) {
        window.updateHelper.forceUpdate();
        return;
    }

    // Méthode 2 : Fallback manuel
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
            console.log('📱 Désinstallation des service workers...');
            registrations.forEach(function (registration) {
                registration.unregister();
            });
        }).then(function () {
            if ('caches' in window) {
                console.log('🗑️ Vidage des caches...');
                caches.keys().then(function (cacheNames) {
                    return Promise.all(
                        cacheNames.map(function (cacheName) {
                            console.log('Suppression du cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                    );
                }).then(function () {
                    console.log('✅ Mise à jour terminée, rechargement...');
                    window.location.reload(true);
                });
            } else {
                console.log('✅ Rechargement forcé...');
                window.location.reload(true);
            }
        });
    } else {
        console.log('⚠️ Service Workers non supportés, rechargement simple...');
        window.location.reload(true);
    }
}

// Rendre la fonction disponible globalement
window.forceAppUpdate = forceAppUpdate;

console.log('🚀 Script de mise à jour chargé. Tapez "forceAppUpdate()" dans la console pour forcer une mise à jour.');