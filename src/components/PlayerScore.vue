<template>
  <div class="player-score" :class="{ 'white-player': isPlayer1 }">
    <!-- Nom du joueur -->
    <div v-if="!editingName" class="player-name" @click="startEditName">
      <div class="name-actions">
        <span class="edit-hint">✏️</span>
      </div>
      <span v-if="player.name" class="name-text">{{ player.name }}</span>
      <span v-else class="name-placeholder">Cliquez pour nommer</span>
      <div class="name-actions">
        <button v-if="player.name" @click.stop="clearName" class="clear-name-btn">✕</button>
      </div>
    </div>
    <input
      v-else
      v-model="tempName"
      @blur="saveName"
      @keyup.enter="saveName"
      @keyup.escape="cancelEdit"
      class="player-name-input"
      maxlength="20"
      placeholder="Nom du joueur"
      ref="nameInput"
    />

        <!-- Score total -->
    <div class="total-score">
      {{ getTotalScore() }}
    </div>

    <!-- Métriques du joueur -->
    <div class="player-metrics">
      <div class="metric-item">
        <span class="metric-label">Moyenne</span>
        <span class="metric-value">{{ getPlayerAverage() }}</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">Série max</span>
        <span class="metric-value">{{ getBestSeries() }}</span>
      </div>
    </div>

    <!-- Pavé numérique -->
    <div class="keypad">
      <div class="keypad-row">
        <button
          v-for="num in [1, 2, 3]"
          :key="num"
          @click="addDigit(num)"
          class="key-btn number"
        >
          {{ num }}
        </button>
      </div>
      <div class="keypad-row">
        <button
          v-for="num in [4, 5, 6]"
          :key="num"
          @click="addDigit(num)"
          class="key-btn number"
        >
          {{ num }}
        </button>
      </div>
      <div class="keypad-row">
        <button
          v-for="num in [7, 8, 9]"
          :key="num"
          @click="addDigit(num)"
          class="key-btn number"
        >
          {{ num }}
        </button>
      </div>
      <div class="keypad-row">
        <button @click="clear" class="key-btn clear" :class="{ 'disabled': clearCooldown }">C</button>
        <button @click="addDigit(0)" class="key-btn number">0</button>
        <button v-if="currentInput" @click="validateSeries" class="key-btn validate">✓</button>
        <button v-else @click="validateNegativeSeries" class="key-btn negative">-</button>
      </div>
    </div>


  </div>
</template>

<script>
export default {
  name: 'PlayerScore',
  props: {
    player: {
      type: Object,
      required: true
    },
    isPlayer1: {
      type: Boolean,
      default: false
    },
    reprises: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      currentInput: '',
      isNegativeMode: false,
      editingName: false,
      tempName: '',
      lastClearAction: null,
      clearCooldown: false,
      autoValidateTimer: null
    }
  },
  methods: {
    addDigit(digit) {
      if (this.currentInput.length < 3) {
        // Ajouter une vibration courte pour le retour haptique
        if (navigator.vibrate) {
          navigator.vibrate(100); // Vibration de 50ms
        }

        this.currentInput += digit.toString();
        this.$emit('input-change', this.currentInput);
        // Réinitialiser l'état du bouton C lors de la saisie
        this.lastClearAction = null;
        this.clearCooldown = false;

        // Démarrer ou redémarrer le timer de validation automatique
        this.startAutoValidateTimer();
      }
    },
    clear() {
      if (this.currentInput) {
        // Si on est en cours de saisie, on efface la saisie
        this.stopAutoValidateTimer();
        this.currentInput = '';
        this.isNegativeMode = false;
        this.$emit('input-change', this.currentInput);
        this.$emit('negative-mode-change', this.isNegativeMode);
        this.lastClearAction = 'clear-input';
      } else {
        // Si pas de saisie en cours, on annule la dernière série
        // Empêcher d'appuyer deux fois de suite pour undo
        if (this.clearCooldown || this.lastClearAction === 'undo-series') {
          return; // Ignorer le clic
        }

        this.$emit('undo-last-series');
        this.lastClearAction = 'undo-series';
        this.clearCooldown = true;

        // Réinitialiser le cooldown après 1 seconde
        setTimeout(() => {
          this.clearCooldown = false;
          this.lastClearAction = null;
        }, 1000);
      }
    },
    validateSeries() {
      this.stopAutoValidateTimer();
      const value = parseInt(this.currentInput) || 0;
      const finalValue = this.isNegativeMode ? -value : value;
      this.$emit('add-series', finalValue);
      this.currentInput = '';
      this.isNegativeMode = false;
      this.$emit('input-change', this.currentInput);
      this.$emit('negative-mode-change', this.isNegativeMode);
      // Réinitialiser l'état du bouton C après validation d'une série
      this.lastClearAction = null;
      this.clearCooldown = false;
    },
        validateNegativeSeries() {
      this.stopAutoValidateTimer();
      this.isNegativeMode = true;
      this.currentInput = '';
      this.$emit('input-change', this.currentInput);
      this.$emit('negative-mode-change', this.isNegativeMode);
      // Réinitialiser l'état du bouton C en mode négatif
      this.lastClearAction = null;
      this.clearCooldown = false;
    },

    resetScore() {
      this.$emit('update-score', 0);
      this.currentInput = '';
      this.isNegativeMode = false;
    },
    startEditName() {
      this.editingName = true;
      this.tempName = this.player.name || '';
      this.$nextTick(() => {
        this.$refs.nameInput.focus();
        if (this.tempName) {
          this.$refs.nameInput.select();
        }
      });
    },
    saveName() {
      const newName = this.tempName.trim();
      if (newName !== this.player.name) {
        this.$emit('update-name', newName.toUpperCase());
      }
      this.editingName = false;
    },
    cancelEdit() {
      this.editingName = false;
      this.tempName = '';
    },
    clearName() {
      this.$emit('update-name', '');
    },
    getTotalScore() {
      return this.reprises.reduce((acc, reprise) => acc + reprise[this.player.id], 0);
    },
    getPlayerAverage() {
      if (this.reprises.length < 1) return '';
      const score = this.getTotalScore();
      return (score / this.reprises.length).toFixed(2);
    },
    getBestSeries() {
      if (this.reprises.length === 0) return '0';
      return this.reprises.reduce((acc, reprise) => {
        const currentScore = reprise[this.player.id];
        if (currentScore > acc) {
          return currentScore;
        }
        return acc;
      }, 0);
    },
    startAutoValidateTimer() {
      // Arrêter le timer existant s'il y en a un
      this.stopAutoValidateTimer();

      // Émettre le début du timer
      this.$emit('auto-validate-start');

      // Démarrer un nouveau timer de 3 secondes
      this.autoValidateTimer = setTimeout(() => {
        if (this.currentInput || this.isNegativeMode) {
          // Validation automatique
          this.validateSeries();
        }
      }, 3000);
    },
    stopAutoValidateTimer() {
      if (this.autoValidateTimer) {
        clearTimeout(this.autoValidateTimer);
        this.autoValidateTimer = null;
        // Émettre l'arrêt du timer
        this.$emit('auto-validate-stop');
      }
    }
  },
  beforeUnmount() {
    // Nettoyer le timer lors de la destruction du composant
    this.stopAutoValidateTimer();
  }
}
</script>

<style scoped>
.player-score {
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 5px;
  width: 100%;
  box-sizing: border-box;
}

.player-name {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: bold;
  text-align: center;
  margin-bottom: 5px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  cursor: pointer;
  padding: 10px;
  border-radius: 10px;
  transition: all 0.2s;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.player-name:hover {
  background: rgba(255,255,255,0.1);
}

.name-text {
  flex: 1;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
}

.name-placeholder {
  flex: 1;
  text-align: center;
  opacity: 0.6;
  font-style: italic;
  font-size: 0.9em;
}

.name-actions {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.edit-hint {
  opacity: 0;
  transition: opacity 0.2s;
  font-size: clamp(1rem, 2.5vw, 1.5rem);
}

.player-name:hover .edit-hint {
  opacity: 0.7;
}

.clear-name-btn {
  opacity: 0;
  transition: opacity 0.2s;
  background: rgba(231, 76, 60, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.player-name:hover .clear-name-btn {
  opacity: 0.8;
}

.clear-name-btn:hover {
  opacity: 1 !important;
  background: rgba(192, 57, 43, 0.9);
  transform: scale(1.1);
}

.player-name-input {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  background: rgba(255,255,255,0.9);
  color: #2c3e50;
  border: 3px solid #f1c40f;
  border-radius: 10px;
  padding: 10px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  min-height: 3rem;
}

.total-score {
  font-size: 20vw;
  line-height: 13vw;
  font-weight: bold;
  text-align: center;
  margin: 5px 0;
  text-shadow: 3px 3px 6px rgba(0,0,0,0.7);
  padding: 10px 5px;
  border-radius: 15px;
  min-width: 200px;
  position: relative;
}

.player-metrics {
  display: flex;
  justify-content: space-around;
  gap: 15px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.metric-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: normal;
}

.metric-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #f1c40f;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.keypad {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 5px 0;
}

.keypad-row {
  display: flex;
  gap: 10px;
}

.key-btn {
  width: 80px;
  height: 80px;
  font-size: 2rem;
  font-weight: bold;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
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

.key-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.key-btn.number {
  background: rgba(255,255,255,0.9);
  color: #2c3e50;
}

.key-btn.number:hover {
  background: rgba(255,255,255,1);
}

.key-btn.clear {
  background: #e74c3c;
  color: white;
}

.key-btn.clear:hover {
  background: #c0392b;
}

.key-btn.validate {
  background: #27ae60;
  color: white;
}

.key-btn.validate:hover {
  background: #219a52;
}

.key-btn.negative {
  background: #e67e22;
  color: white;
}

.key-btn.negative:hover {
  background: #d35400;
}

.key-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.key-btn.disabled:hover {
  background: #e74c3c; /* Garde la couleur normale, pas d'effet hover */
}

/* Styles spécifiques pour le joueur blanc (bille blanche) */
.white-player .player-name {
  color: #2c3e50;
  text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
}

.white-player .name-placeholder {
  color: #6c757d;
}

.white-player .total-score {
  color: #2c3e50;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.white-player .player-name:hover {
  background: rgba(44, 62, 80, 0.1);
}

.white-player .player-name-input {
  background: rgba(255,255,255,0.95);
  color: #2c3e50;
  border-color: #fd7e14;
}

.white-player .player-metrics {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(44, 62, 80, 0.2);
}

.white-player .metric-label {
  color: rgba(44, 62, 80, 0.8);
}

.white-player .metric-value {
  color: #e67e22;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3);
}
</style>