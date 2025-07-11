<template>
  <div v-if="showInstallPrompt" class="install-prompt">
    <div class="install-content">
      <div class="install-icon">📱</div>
      <div class="install-text">
        <h3>Installer l'application</h3>
        <p>Installez Scoreboard sur votre appareil pour un accès rapide et hors ligne</p>
      </div>
      <div class="install-buttons">
        <button @click="installApp" class="install-btn primary">Installer</button>
        <button @click="dismissPrompt" class="install-btn secondary">Plus tard</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InstallPrompt',
  data() {
    return {
      showInstallPrompt: false,
      deferredPrompt: null
    }
  },
  mounted() {
    // Écouter l'événement beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      // Empêcher la mini-barre d'info de Chrome
      e.preventDefault();
      // Stocker l'événement pour l'utiliser plus tard
      this.deferredPrompt = e;
      // Afficher notre prompt personnalisé
      this.showInstallPrompt = true;
    });

    // Vérifier si l'app est déjà installée
    window.addEventListener('appinstalled', () => {
      console.log('PWA installée avec succès');
      this.showInstallPrompt = false;
      this.deferredPrompt = null;
    });
  },
  methods: {
    async installApp() {
      if (this.deferredPrompt) {
        // Afficher le prompt d'installation
        this.deferredPrompt.prompt();
        // Attendre la réponse de l'utilisateur
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`Installation: ${outcome}`);
        // Réinitialiser le prompt
        this.deferredPrompt = null;
        this.showInstallPrompt = false;
      }
    },
    dismissPrompt() {
      this.showInstallPrompt = false;
      // Stocker dans localStorage pour ne pas re-proposer pendant 7 jours
      localStorage.setItem('installPromptDismissed', Date.now().toString());
    }
  }
}
</script>

<style scoped>
.install-prompt {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  z-index: 1000;
  background: rgba(44, 62, 80, 0.95);
  border: 2px solid #34495e;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  backdrop-filter: blur(10px);
  color: white;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.install-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.install-icon {
  font-size: 2.5rem;
}

.install-text {
  flex: 1;
}

.install-text h3 {
  margin: 0 0 5px 0;
  font-size: 1.2rem;
  color: #f1c40f;
}

.install-text p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.install-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.install-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 80px;
}

.install-btn.primary {
  background: #27ae60;
  color: white;
}

.install-btn.primary:hover {
  background: #2ecc71;
}

.install-btn.secondary {
  background: transparent;
  color: #bdc3c7;
  border: 1px solid #7f8c8d;
}

.install-btn.secondary:hover {
  background: rgba(127, 140, 141, 0.2);
}

@media (max-width: 768px) {
  .install-prompt {
    bottom: 10px;
    left: 10px;
    right: 10px;
  }

  .install-content {
    flex-direction: column;
    text-align: center;
  }

  .install-buttons {
    flex-direction: row;
    justify-content: center;
    width: 100%;
  }
}
</style>