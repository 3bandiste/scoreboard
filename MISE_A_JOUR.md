# 🔄 Guide de Mise à Jour de l'Application

## Problèmes résolus

Cette configuration résout les problèmes suivants :
- ✅ Cache persistant qui empêche les mises à jour
- ✅ Service Worker qui ne se met pas à jour
- ✅ Fichiers obsolètes dans le cache
- ✅ Pas de notification de nouvelle version

## Solutions mises en place

### 1. **Versioning automatique**
- Service Worker : `CACHE_NAME = 'scoreboard-v3.0'`
- Manifest : `"version": "3.0"`
- Start URL avec version : `"start_url": "/?v=3.0"`

### 2. **Stratégie de cache hybride**
- **Network First** pour les fichiers critiques (HTML, JS, CSS)
- **Cache First** pour les ressources statiques (images, fonts)

### 3. **Scripts de mise à jour**
- `update-helper.js` : Gestion automatique des mises à jour
- `force-update.js` : Forçage manuel des mises à jour

## Comment déployer une nouvelle version

### Étape 1 : Mise à jour des versions
```bash
# Dans public/sw.js
const CACHE_NAME = 'scoreboard-v3.1';  # Incrémenter

# Dans public/manifest.json
"version": "3.1",
"start_url": "/?v=3.1",
```

### Étape 2 : Mise à jour des fichiers cachés
Vérifier que tous les nouveaux fichiers sont dans `urlsToCache` dans `sw.js`

### Étape 3 : Déployer les fichiers
```bash
# Déployer tous les fichiers sur le serveur
```

## Méthodes de mise à jour pour les utilisateurs

### 1. **Mise à jour automatique**
L'application détecte automatiquement les nouvelles versions et recharge.

### 2. **Mise à jour manuelle (console)**
```javascript
// Ouvrir la console (F12) et taper :
forceAppUpdate()
```

### 3. **Mise à jour par URL**
```
https://votre-app.com/?update=true
```

### 4. **Mise à jour complète**
```javascript
// Dans la console :
window.updateHelper.forceUpdate()
```

## Dépannage

### Problème : L'application ne se met pas à jour
**Solution 1 :** Console → `forceAppUpdate()`
**Solution 2 :** Vider le cache navigateur (Ctrl+Shift+Delete)
**Solution 3 :** Mode navigation privée pour tester

### Problème : Erreurs de cache
**Solution :** Vérifier que tous les fichiers dans `urlsToCache` existent

### Problème : Service Worker bloqué
**Solution :**
```javascript
// Dans la console :
navigator.serviceWorker.getRegistrations().then(function(registrations) {
    registrations.forEach(function(registration) {
        registration.unregister();
    });
}).then(() => location.reload());
```

## Checklist de déploiement

- [ ] Incrémenter la version dans `sw.js`
- [ ] Incrémenter la version dans `manifest.json`
- [ ] Vérifier que tous les fichiers existent
- [ ] Tester en mode navigation privée
- [ ] Vérifier les logs de la console
- [ ] Tester la mise à jour forcée

## Logs utiles

Ouvrir la console pour voir :
- Installation du Service Worker
- Mise en cache des ressources
- Détection des mises à jour
- Erreurs de cache

## Bonnes pratiques

1. **Toujours incrémenter la version** lors des modifications
2. **Tester en navigation privée** avant le déploiement
3. **Vérifier les logs** pour détecter les problèmes
4. **Maintenir la liste des fichiers** dans `urlsToCache`
5. **Informer les utilisateurs** des mises à jour importantes