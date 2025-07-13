<template>
  <div class="player-score-casin" :class="{ 'white-player': isPlayer1 }">
        <!-- Nom du joueur et pattes -->
    <div class="player-header">
      <div class="name-and-pattes-row">
        <div class="player-name-section">
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
        </div>

        <div class="pattes-section">
          <select v-model="pattes" class="pattes-select" @change="updatePattes">
            <option v-for="n in 10" :key="n" :value="n">{{ n }} pattes</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Boutons de types de coups avec scores -->
    <div class="shot-buttons">
      <button
        v-for="shotType in shotTypes"
        :key="shotType.key"
        @click="addShot(shotType.key)"
        class="shot-btn"
        :class="[shotType.key, { 'completed': categoryScores[shotType.key] >= pattes }]"
        :style="{
          backgroundImage: `linear-gradient(to right, ${getShotColor(shotType.key)} 0%, ${getShotColor(shotType.key)} ${(categoryScores[shotType.key] || 0) / pattes * 100}%, rgba(0,0,0,0.3) ${(categoryScores[shotType.key] || 0) / pattes * 100}%, rgba(0,0,0,0.3) 100%)`,
          backgroundSize: '100% 100%'
        }"
      >
        <span class="shot-label">{{ shotType.label }}</span>
        <span class="shot-score">{{ categoryScores[shotType.key] || 0 }}</span>
      </button>
    </div>

    <!-- Indicateur de victoire -->
    <div class="victory-indicator" v-if="isVictorious">
      <div class="victory-message">
        <span class="victory-icon">🏆</span>
        <span class="victory-text">Victoire !</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayerScoreCasin',
  props: {
    player: {
      type: Object,
      required: true
    },
    isPlayer1: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      editingName: false,
      tempName: '',
      pattes: 5,
      categoryScores: {
        'direct': 0,
        'libre': 0,
        'rouge': 0,
        'casin': 0,
        'bande1': 0,
        'bande2': 0,
        'bande3': 0,
        'main-gauche': 0,
        'bande-avant': 0
      },
      shotHistory: [], // Historique des coups pour l'undo
      shotTypes: [
        { key: 'direct', label: 'Direct' },
        { key: 'libre', label: 'Libre' },
        { key: 'rouge', label: 'Rouge' },
        { key: 'casin', label: 'Casin' },
        { key: 'bande1', label: '1 Bande' },
        { key: 'bande2', label: '2 Bandes' },
        { key: 'bande3', label: '3 Bandes' },
        { key: 'main-gauche', label: 'Gauche' },
        { key: 'bande-avant', label: 'B. Avant' }
      ]
    }
  },
  computed: {
    isVictorious() {
      return this.shotTypes.every(shotType =>
        this.categoryScores[shotType.key] >= this.pattes
      );
    }
  },
  watch: {
    categoryScores: {
      handler() {
        this.saveCasinScores();
      },
      deep: true
    },
    pattes() {
      this.saveCasinScores();
    },
    'player.id': {
      handler() {
        this.loadCasinScores();
      },
      immediate: true
    }
  },
  mounted() {
    this.loadCasinScores();
  },
  methods: {
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
    updatePattes() {
      this.$emit('update-pattes', this.pattes);
      // Vérifier la victoire avec le nouveau nombre de pattes
      if (this.isVictorious) {
        this.$emit('victory-achieved');
      }
    },
    addShot(shotType) {
      // Vérifier si la catégorie n'est pas déjà complétée
      if (this.categoryScores[shotType] >= this.pattes) {
        return;
      }

      // Ajouter une vibration
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }

      this.categoryScores[shotType]++;
      this.$emit('shot-added', shotType);

      // Ajouter le coup à l'historique
      this.shotHistory.push({
        type: shotType,
        score: this.categoryScores[shotType]
      });

      // Vérifier la victoire
      if (this.isVictorious) {
        this.$emit('victory-achieved');
      }
    },
    undoLastShot() {
      if (this.shotHistory.length > 0) {
        const lastShot = this.shotHistory.pop();
        this.categoryScores[lastShot.type]--;
        this.$emit('shot-undone', lastShot.type);
      }
    },
    resetScores() {
      Object.keys(this.categoryScores).forEach(key => {
        this.categoryScores[key] = 0;
      });
      this.shotHistory = []; // Clear history on reset
      this.$emit('reset-scores');
    },
         resetAllScores() {
       this.resetScores();
       this.clearSavedScores();
       this.$emit('reset-all-scores');
     },
     clearSavedScores() {
       localStorage.removeItem(`casinScores_${this.player.id}`);
     },
    getShotColor(shotType) {
      // Toutes les catégories utilisent la même couleur (bleu de "libre")
      return '#2980b9';
    },
    saveCasinScores() {
      localStorage.setItem(`casinScores_${this.player.id}`, JSON.stringify(this.categoryScores));
    },
    loadCasinScores() {
      const savedScores = localStorage.getItem(`casinScores_${this.player.id}`);
      if (savedScores) {
        this.categoryScores = JSON.parse(savedScores);
      }
    }
  },
  // Exposer les méthodes pour que le parent puisse les appeler
  expose: ['undoLastShot', 'resetAllScores', 'resetScores', 'clearSavedScores', 'loadCasinScores']
}
</script>

<style scoped>
.player-score-casin {
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
}

.player-header {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
}

.name-and-pattes-row {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  justify-content: center;
}

.player-name-section {
  flex: 1;
  max-width: 300px;
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

.pattes-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.pattes-label {
  font-size: 1rem;
  font-weight: bold;
  color: #f1c40f;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
}

.pattes-select {
  font-size: 1.2rem;
  padding: 6px 12px;
  border: 2px solid #f1c40f;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  font-weight: bold;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
  min-width: 60px;
}

.pattes-select:hover {
  background: rgba(255, 255, 255, 1);
}

.shot-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;
  flex: 1;
}

.shot-btn {
  position: relative;
  padding: 25px;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  height: 80px;
  min-height: 80px;
}

.shot-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.4);
}

.shot-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.shot-btn.completed {
  background: linear-gradient(to right, #27ae60 0%, #27ae60 100%) !important;
  cursor: not-allowed;
  border-color: #27ae60;
}

.shot-btn.completed:hover {
  transform: none;
  border-color: #27ae60;
}

.shot-label {
  font-size: 2rem;
  font-weight: bold;
  text-align: left;
  flex: 1;
  text-transform: uppercase;
}

.shot-score {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  text-align: right;
}



.victory-indicator {
  width: 100%;
  padding: 20px;
  background: linear-gradient(135deg, #f39c12, #e67e22);
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  animation: victory-pulse 2s ease-in-out infinite;
}

.victory-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.victory-icon {
  font-size: 2rem;
  animation: victory-rotate 2s linear infinite;
}

.victory-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

@keyframes victory-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes victory-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Styles spécifiques pour le joueur blanc */
.white-player .player-name {
  color: #2c3e50;
  text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
}

.white-player .name-placeholder {
  color: #6c757d;
}

.white-player .player-name:hover {
  background: rgba(44, 62, 80, 0.1);
}

.white-player .player-name-input {
  background: rgba(255,255,255,0.95);
  color: #2c3e50;
  border-color: #fd7e14;
}

.white-player .pattes-label {
  color: #e67e22;
}

.white-player .pattes-select {
  border-color: #e67e22;
}
</style>