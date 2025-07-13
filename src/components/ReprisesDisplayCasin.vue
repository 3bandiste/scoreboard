<template>
  <div class="reprises-display-casin">
    <!-- Actions de jeu -->
    <div class="game-actions">
      <button @click="swapNames" class="swap-btn">
        <span class="swap-text">Permuter</span>
      </button>

      <button @click="newGame" class="new-game-btn">
        <span class="new-game-text">Nouvelle partie</span>
      </button>
    </div>



    <!-- Historique des coups -->
    <div class="shots-history" v-if="recentShots.length > 0">
      <h3>Derniers coups</h3>
      <div class="shots-list">
        <div
          v-for="(shot, index) in recentShots.slice(-10)"
          :key="index"
          class="shot-item"
          :class="{ 'player1': shot.player === 1, 'player2': shot.player === 2 }"
        >
          <span class="shot-player">{{ shot.playerName || ('Joueur ' + shot.player) }}</span>
          <span class="shot-type">{{ formatShotType(shot.type) }}</span>
        </div>
      </div>
    </div>

    <!-- Bouton d'annulation -->
    <div class="undo-section" v-if="canUndo">
      <button @click="undoLastAction" class="undo-btn">
        <span class="undo-icon">↶</span>
        <span class="undo-text">Annuler</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReprisesDisplayCasin',
  props: {
    recentShots: {
      type: Array,
      default: () => []
    },
    canUndo: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    newGame() {
      this.$emit('new-game');
    },
    swapNames() {
      this.$emit('swap-names');
    },
    undoLastAction() {
      this.$emit('undo-last-action');
    },
    formatShotType(type) {
      const shotTypes = {
        'direct': 'Direct',
        'libre': 'Libre',
        'rouge': 'Rouge',
        'casin': 'Casin',
        'bande1': '1 Bande',
        'bande2': '2 Bandes',
        'bande3': '3 Bandes',
        'main-gauche': 'Main gauche',
        'bande-avant': 'Bande avant'
      };
      return shotTypes[type] || type;
    }
  }
}
</script>

<style scoped>
.reprises-display-casin {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  gap: 20px;
}

.game-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.swap-btn, .new-game-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 15px 20px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.swap-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.swap-btn:hover {
  background: linear-gradient(135deg, #5dade2, #3498db);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

.new-game-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.new-game-btn:hover {
  background: linear-gradient(135deg, #ec7063, #e74c3c);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

.swap-icon, .new-game-icon {
  font-size: 1.8rem;
}

.swap-text, .new-game-text {
  font-size: 0.9rem;
}



.shots-history {
  flex: 1;
  overflow-y: auto;
}

.shots-history h3 {
  margin: 0 0 15px 0;
  font-size: 1.2rem;
  color: #ecf0f1;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.shots-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border-left: 4px solid #3498db;
  font-size: 0.85rem;
}

.shot-item.player1 {
  border-left-color: #ecf0f1;
}

.shot-item.player2 {
  border-left-color: #e67e22;
}

.shot-player {
  font-weight: bold;
  color: #ecf0f1;
  min-width: 80px;
}

.shot-type {
  flex: 1;
  text-align: right;
  color: #f1c40f;
  font-weight: bold;
}

.undo-section {
  display: flex;
  justify-content: center;
}

.undo-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

.undo-btn:hover {
  background: linear-gradient(135deg, #f7c52d, #f39c12);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.undo-icon {
  font-size: 1.5rem;
}

.undo-text {
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .reprises-display-casin {
    padding: 15px;
    gap: 15px;
  }

  .game-actions {
    flex-direction: column;
    gap: 10px;
  }

  .swap-btn, .new-game-btn {
    padding: 12px 15px;
  }

  .swap-icon, .new-game-icon {
    font-size: 1.5rem;
  }

  .swap-text, .new-game-text {
    font-size: 0.8rem;
  }

  .shot-item {
    flex-direction: column;
    gap: 5px;
    align-items: flex-start;
  }

  .shot-player, .shot-type {
    min-width: auto;
    text-align: left;
  }
}
</style>