<template>
  <div class="reprises-display">
    <div class="header">
      <div class="current-reprise-counter">
        <div class="reprise-controls" style="margin-top: 20px;">
          <button @click="decrementReprise" class="reprise-btn minus" :class="{ 'hidden-btn': currentReprise === 0, 'disabled': hasInputInProgress }" :disabled="hasInputInProgress">-</button>
          <div class="reprise-number-big">
            {{ currentReprise }}
          </div>
          <button @click="incrementReprise" class="reprise-btn plus" :class="{ 'disabled': hasInputInProgress }" :disabled="hasInputInProgress">+</button>
        </div>
        <div class="action-buttons">
          <button @click="$emit('swap-names')" class="swap-names-btn">
            ⇄ échanger noms
          </button>
          <button @click="toggleFullscreen" class="fullscreen-btn">
            📄 Feuille de match
          </button>
        </div>
      </div>
         </div>

    <!-- Saisies en cours -->
    <div v-if="player1Input || player2Input || player1Negative || player2Negative" class="current-inputs">
      <h3>Saisies en cours</h3>
      <div class="inputs-container">
        <div v-if="player1Input || player1Negative" class="input-display player1">
          <div class="player-label">Joueur 1</div>
          <div class="input-value">
            <span v-if="player1Negative" class="negative-indicator">-</span>{{ player1Input || '?' }}
          </div>
        </div>
        <div v-if="player2Input || player2Negative" class="input-display player2">
          <div class="player-label">Joueur 2</div>
          <div class="input-value">
            <span v-if="player2Negative" class="negative-indicator">-</span>{{ player2Input || '?' }}
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <ReprisesTable :reprises="reprises" :nbReprisesToShow="10" />
    </div>
    <button @click="$emit('new-game')" class="new-game-btn">
        🎯 Nouvelle partie
    </button>
  </div>

  <!-- Overlay plein écran -->
  <div v-if="isFullscreen" class="fullscreen-overlay">
    <div class="fullscreen-content">
      <div class="fullscreen-header">
        <h2>📄 Feuille de match</h2>
        <button @click="toggleFullscreen" class="close-btn">✕</button>
      </div>

      <div class="fullscreen-body">
        <!-- Informations de la partie -->
        <div class="game-info">
          <div class="game-info-row">
            <span class="info-label">Reprises jouées :</span>
            <span class="info-value">{{ currentReprise }}</span>
          </div>
          <div class="game-info-row">
            <span class="info-label">{{ player1Name || 'Joueur 1' }} :</span>
            <span class="info-value">{{ getTotalScore('player1') }} points</span>
          </div>
          <div class="game-info-row">
            <span class="info-label">{{ player2Name || 'Joueur 2' }} :</span>
            <span class="info-value">{{ getTotalScore('player2') }} points</span>
          </div>
        </div>

        <!-- Statistiques détaillées -->
        <div class="detailed-stats">
          <div class="stat-section">
            <h3>📊 Statistiques {{ player1Name || 'Joueur 1' }}</h3>
            <div class="stat-grid">
              <div class="stat-item">
                <span class="stat-label">Total :</span>
                <span class="stat-value">{{ getTotalScore('player1') }}</span>
              </div>
            </div>
          </div>

          <div class="stat-section">
            <h3>📊 Statistiques {{ player2Name || 'Joueur 2' }}</h3>
            <div class="stat-grid">
              <div class="stat-item">
                <span class="stat-label">Total :</span>
                <span class="stat-value">{{ getTotalScore('player2') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tableau complet des reprises -->
        <div class="fullscreen-table">
          <ReprisesTable :reprises="reprises" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ReprisesTable from './ReprisesTable.vue'

export default {
  name: 'ReprisesDisplay',
  components: {
    ReprisesTable
  },
  emits: ['reset-reprise', 'increment-reprise', 'decrement-reprise', 'new-game', 'swap-names'],
  props: {
    reprises: {
      type: Array,
      default: () => []
    },
    player1Input: {
      type: String,
      default: ''
    },
    player2Input: {
      type: String,
      default: ''
    },
    player1Negative: {
      type: Boolean,
      default: false
    },
    player2Negative: {
      type: Boolean,
      default: false
    },
    player1Name: {
      type: String,
      default: ''
    },
    player2Name: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isFullscreen: false
    };
  },
     computed: {
     currentReprise() {
       return this.reprises.length;
     },
     hasInputInProgress() {
       return !!(this.player1Input || this.player2Input || this.player1Negative || this.player2Negative);
     }
   },
  methods: {
    incrementReprise() {
      if (!this.hasInputInProgress) {
        this.$emit('increment-reprise');
      }
    },
    decrementReprise() {
      if (!this.hasInputInProgress) {
        this.$emit('decrement-reprise');
      }
    },
    formatTime(timestamp) {
      return timestamp.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },



    getTotalScore(playerNum) {
      return this.reprises.reduce((acc, reprise) => acc + reprise[playerNum], 0);
    },
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;

      // Empêcher le scroll du body quand le modal est ouvert
      if (this.isFullscreen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  },
  beforeUnmount() {
    // Restaurer le scroll du body si le composant est détruit en mode plein écran
    document.body.style.overflow = '';
  },
  watch: {
    reprises: {
      handler() {
        // Auto-scroll vers le bas quand une nouvelle reprise est ajoutée
        this.$nextTick(() => {
          const list = this.$refs.reprisesList;
          if (list) {
            list.scrollTop = list.scrollHeight;
          }
        });
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.reprises-display {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: white;
  position: relative;
}

.reprises-display::before {
  content: '';
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  height: 225px;
  background-image: url('/logo-voisins-2.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  opacity: 0.5;
  z-index: 0;
  pointer-events: none;
}

.header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(255,255,255,0.3);
  position: relative;
  z-index: 1;
}

.header h2 {
  margin: 0 0 20px 0;
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.current-reprise-counter {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.reprise-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reprise-number-big {
  font-size: 15vw;
  font-weight: bold;
  color: #f1c40f;
  text-shadow: 3px 3px 6px rgba(0,0,0,0.7);
  border: 4px solid rgba(241, 196, 15, 0.3);
  padding: 20px;
  border-radius: 15px;
  background: rgba(0,0,0,0.3);
  min-width: 120px;
  text-align: center;
  position: relative;
}

.reprise-btn {
  width: 60px;
  height: 60px;
  font-size: 2rem;
  font-weight: bold;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1;
  -webkit-appearance: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

.reprise-btn.minus {
  background: #e74c3c;
}

.reprise-btn.minus:hover {
  background: #c0392b;
}

.reprise-btn.plus {
  background: #27ae60;
}

.reprise-btn.plus:hover {
  background: #219a52;
}

.reprise-btn:active {
  transform: scale(0.95);
}

.reprise-btn.hidden-btn {
  visibility: hidden;
  pointer-events: none;
}

.reprise-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.reset-reprise-btn-mini {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 30px;
  height: 30px;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(243, 156, 18, 0.8);
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1;
  -webkit-appearance: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

.reset-reprise-btn-mini:hover {
  background: rgba(230, 126, 34, 0.9);
  transform: scale(1.1);
}

.reset-reprise-btn-mini:active {
  transform: scale(0.95);
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  justify-content: center;
}

.swap-names-btn {
  padding: 8px 12px;
  font-size: 0.9rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 3px 6px rgba(0,0,0,0.3);
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1;
  -webkit-appearance: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  flex: 1;
  min-width: 0;
}

.swap-names-btn:hover {
  background: #2980b9;
}

.swap-names-btn:active {
  transform: scale(0.95);
}

.fullscreen-btn {
  padding: 8px 12px;
  font-size: 0.9rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 3px 6px rgba(0,0,0,0.3);
  background: #9b59b6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1;
  -webkit-appearance: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  flex: 1;
  min-width: 0;
}

.fullscreen-btn:hover {
  background: #8e44ad;
}

.fullscreen-btn:active {
  transform: scale(0.95);
}

.new-game-btn {
  padding: 15px 25px;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  background: #8e44ad;
  color: white;
  margin-top: auto;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1;
  -webkit-appearance: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  position: relative;
  z-index: 2;
}

.new-game-btn:hover {
  background: #9b59b6;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.4);
}

.new-game-btn:active {
  transform: scale(0.95);
}

.reprises-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 10px;
  background: rgba(0,0,0,0.2);
}

.reprise-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 15px;
  border-radius: 10px;
  background: rgba(255,255,255,0.1);
  border-left: 5px solid transparent;
  transition: all 0.3s ease;
}

.reprise-item.player1 {
  border-left-color: #27ae60;
  background: rgba(39, 174, 96, 0.2);
}

.reprise-item.player2 {
  border-left-color: #e74c3c;
  background: rgba(231, 76, 60, 0.2);
}

.reprise-number {
  font-size: 1.8rem;
  font-weight: bold;
  margin-right: 20px;
  min-width: 50px;
  text-align: center;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reprise-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.player-indicator {
  font-size: 1.2rem;
  font-weight: bold;
  opacity: 0.8;
}

.reprise-value {
  font-size: 2rem;
  font-weight: bold;
  color: #f1c40f;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.reprise-time {
  font-size: 1rem;
  opacity: 0.7;
  font-style: italic;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 1.5rem;
  text-align: center;
}

.summary {
  padding: 20px;
  background: rgba(0,0,0,0.3);
  border-radius: 10px;
  border: 2px solid rgba(255,255,255,0.2);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.summary-item:last-child {
  margin-bottom: 0;
  border-top: 1px solid rgba(255,255,255,0.3);
  padding-top: 10px;
  font-weight: bold;
}

.label {
  opacity: 0.8;
}

.value {
  font-weight: bold;
  color: #f1c40f;
}

/* Scrollbar styling */
.reprises-list::-webkit-scrollbar {
  width: 8px;
}

.reprises-list::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
}

.reprises-list::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.3);
  border-radius: 4px;
}

.reprises-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.5);
}

@media (max-width: 768px) {
  .header h2 {
    font-size: 2rem;
  }


  .reprise-btn {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    line-height: 1;
  }

  .reprise-number-big {
    font-size: 3rem;
    padding: 15px;
    min-width: 100px;
  }

  .reprise-item {
    flex-direction: column;
    text-align: center;
  }

  .reprise-content {
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
  }

  .reprise-number {
    margin-right: 0;
    margin-bottom: 10px;
  }

  .current-inputs h3 {
    font-size: 1.5rem;
  }

  .inputs-container {
    flex-direction: column;
    gap: 10px;
  }

  .input-display {
    padding: 15px;
  }

  .player-label {
    font-size: 1rem;
  }

  .input-value {
    font-size: 15vw;
  }

  .new-game-btn {
    padding: 12px 20px;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    line-height: 1;
  }

  .action-buttons {
    gap: 8px;
    margin-top: 10px;
  }

  .swap-names-btn, .fullscreen-btn {
    padding: 6px 8px;
    font-size: 0.8rem;
  }

  .reset-reprise-btn-mini {
    width: 25px;
    height: 25px;
    font-size: 1rem;
    bottom: 3px;
    right: 3px;
  }



  .reprises-display::before {
    width: 120px;
    height: 150px;
    bottom: 10px;
    opacity: 0.1;
  }
}

/* Styles pour les saisies en cours */
.current-inputs {
  margin-top: 20px;
  padding: 20px;
  background: rgba(0,0,0,0.8);
  border-radius: 15px;
  border: 2px solid rgba(255,255,255,0.2);
  position: relative;
  z-index: 1;
}

.current-inputs h3 {
  margin: 0 0 15px 0;
  font-size: 1.8rem;
  text-align: center;
  color: #f1c40f;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.inputs-container {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.input-display {
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.input-display.player1 {
  border-color: #27ae60;
  background: rgba(39, 174, 96, 0.2);
}

.input-display.player2 {
  border-color: #e74c3c;
  background: rgba(231, 76, 60, 0.2);
}

.player-label {
  font-size: 1.2rem;
  margin-bottom: 10px;
  opacity: 0.8;
  font-weight: bold;
}

.input-value {
  font-size: 15vw;
  font-weight: bold;
  color: #f1c40f;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
}

.negative-indicator {
  color: #e74c3c;
  margin-right: 5px;
  font-weight: bold;
}



/* Styles pour l'overlay plein écran */
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.fullscreen-content {
  background: linear-gradient(135deg, #34495e, #2c3e50);
  border-radius: 15px;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.8);
  color: white;
}

.fullscreen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 2px solid rgba(255,255,255,0.2);
  background: rgba(0,0,0,0.3);
}

.fullscreen-header h2 {
  margin: 0;
  font-size: 2rem;
  color: #f1c40f;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.close-btn {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  -webkit-appearance: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.close-btn:hover {
  background: #c0392b;
  transform: scale(1.1);
}

.fullscreen-body {
  padding: 30px;
}

.game-info {
  background: rgba(0,0,0,0.3);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  border: 1px solid rgba(255,255,255,0.1);
}

.game-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.game-info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 1.2rem;
  color: #bdc3c7;
}

.info-value {
  font-size: 1.3rem;
  font-weight: bold;
  color: #f1c40f;
}

.detailed-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.stat-section {
  background: rgba(0,0,0,0.3);
  border-radius: 10px;
  padding: 20px;
  border: 1px solid rgba(255,255,255,0.1);
}

.stat-section h3 {
  margin: 0 0 20px 0;
  font-size: 1.4rem;
  color: #3498db;
  text-align: center;
}

.stat-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: rgba(255,255,255,0.05);
  border-radius: 5px;
}

.stat-label {
  color: #bdc3c7;
  font-size: 1rem;
}

.stat-value {
  font-weight: bold;
  color: #ecf0f1;
  font-size: 1.1rem;
}

.fullscreen-table {
  background: rgba(0,0,0,0.3);
  border-radius: 10px;
  padding: 20px;
  border: 1px solid rgba(255,255,255,0.1);
}

/* Styles responsive pour le plein écran */
@media (max-width: 768px) {
  .fullscreen-overlay {
    padding: 10px;
  }

  .fullscreen-header {
    padding: 15px 20px;
  }

  .fullscreen-header h2 {
    font-size: 1.5rem;
  }

  .fullscreen-body {
    padding: 20px;
  }

  .detailed-stats {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .game-info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }



  .stat-section h3 {
    font-size: 1.2rem;
  }

  .close-btn {
    width: 35px;
    height: 35px;
    font-size: 1.2rem;
  }
}


</style>