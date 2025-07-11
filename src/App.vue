<template>
  <div class="scoreboard">
    <!-- Joueur 1 - Gauche -->
    <div class="player-section left">
      <PlayerScore
        :player="player1"
        :is-player1="true"
        :reprises="reprises"
        @update-score="updatePlayerScore(1, $event)"
        @add-series="addSeries(1, $event)"
        @input-change="updatePlayerInput(1, $event)"
        @negative-mode-change="updatePlayerNegativeMode(1, $event)"
        @undo-last-series="undoLastSeries(1)"
        @update-name="updatePlayerName(1, $event)"
      />
    </div>

    <!-- Centre - Reprises -->
    <div class="center-section">
            <ReprisesDisplay
        :reprises="reprises"
        :player1-input="player1Input"
        :player2-input="player2Input"
        :player1-negative="player1Negative"
        :player2-negative="player2Negative"
        :player1-score="player1.score"
        :player2-score="player2.score"
        :player1-name="player1.name"
        :player2-name="player2.name"
        @increment-reprise="incrementReprise"
        @decrement-reprise="decrementReprise"
        @new-game="newGame"
        @swap-names="swapPlayerNames"
      />
    </div>

    <!-- Joueur 2 - Droite -->
    <div class="player-section right">
      <PlayerScore
        :player="player2"
        :is-player1="false"
        :reprises="reprises"
        @update-score="updatePlayerScore(2, $event)"
        @add-series="addSeries(2, $event)"
        @input-change="updatePlayerInput(2, $event)"
        @negative-mode-change="updatePlayerNegativeMode(2, $event)"
        @undo-last-series="undoLastSeries(2)"
        @update-name="updatePlayerName(2, $event)"
      />
    </div>

    <!-- Prompt d'installation PWA -->
    <InstallPrompt />
  </div>
</template>

<script>
import PlayerScore from './components/PlayerScore.vue'
import ReprisesDisplay from './components/ReprisesDisplay.vue'
import InstallPrompt from './components/InstallPrompt.vue'

export default {
  name: 'App',
  components: {
    PlayerScore,
    ReprisesDisplay,
    InstallPrompt
  },
  data() {
    return {
      player1: {
        id: 'player1',
        name: 'Joueur 1',
        currentSeries: 0
      },
      player2: {
        id: 'player2',
        name: 'Joueur 2',
        currentSeries: 0
      },
      player1Input: '',
      player2Input: '',
      player1Negative: false,
      player2Negative: false,
      reprises: [],
      saveTimeout: null
    }
  },
  mounted() {
    // Attendre que le DOM soit complètement chargé
    this.$nextTick(() => {
      // Petite pause pour éviter les conflits avec le service worker
      setTimeout(() => {
        this.loadGameData();
      }, 100);
    });
  },
  beforeUnmount() {
    // Nettoyer le timeout de sauvegarde
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
  },
  watch: {
    // Sauvegarder automatiquement lors des changements
    player1: {
      handler() {
        this.saveGameData();
      },
      deep: true
    },
    player2: {
      handler() {
        this.saveGameData();
      },
      deep: true
    },
    reprises: {
      handler() {
        this.saveGameData();
      },
      deep: true
    },
    player1Input() {
      this.saveGameData();
    },
    player2Input() {
      this.saveGameData();
    },
    player1Negative() {
      this.saveGameData();
    },
    player2Negative() {
      this.saveGameData();
    }
  },
  methods: {
    updatePlayerScore(playerNum, newScore) {
      if (playerNum === 1) {
        this.player1.score = newScore;
      } else {
        this.player2.score = newScore;
      }
    },
    addSeries(playerNum, seriesValue) {
      console.log(playerNum, seriesValue)
      const currentRepriseIndex = this.reprises.length - 1;
      if (playerNum === 1) {
        // Suite a une annulation de série, on remplace la série par la nouvelle
        if (currentRepriseIndex >= 0 && this.reprises[currentRepriseIndex].player1 === null) {
          this.reprises[currentRepriseIndex].player1 = seriesValue;
        } else {
          this.addReprise(seriesValue);
        }
      } else {
        if (currentRepriseIndex >= 0 && this.reprises[currentRepriseIndex].player2 === null) {
          this.reprises[currentRepriseIndex].player2 = seriesValue;
        } else {
          // Le joueur 1 a oublié de saisir une série, on ajoute une reprise avec une série à 0
          this.addReprise(0, seriesValue);
        }
      }
    },

    addReprise(serie1, serie2 = null) {
      //Si le joueur 2 a un score null, alors on le remplace par 0
      if (this.reprises.length > 0 && this.reprises[this.reprises.length - 1].player2 === null) {
        this.reprises[this.reprises.length - 1].player2 = 0;
      }
      this.reprises.push({
        player1: serie1,
        player2: serie2
      });
    },
    updatePlayerInput(playerNum, inputValue) {
      if (playerNum === 1) {
        this.player1Input = inputValue;
      } else {
        this.player2Input = inputValue;
      }
    },
    updatePlayerNegativeMode(playerNum, isNegative) {
      if (playerNum === 1) {
        this.player1Negative = isNegative;
      } else {
        this.player2Negative = isNegative;
      }
    },
    updatePlayerName(playerNum, newName) {
      if (playerNum === 1) {
        this.player1.name = newName;
      } else {
        this.player2.name = newName;
      }
    },
    incrementReprise() {
      this.addReprise(0, null);
    },
    decrementReprise() {
      this.reprises.pop();
    },
    undoLastSeries(playerNum) {
      // Avec la nouvelle structure, on annule la dernière reprise
      if (this.reprises.length === 0) return;
      if (playerNum === 1) {
        this.player1.score -= this.reprises[this.reprises.length - 1].player1;
        this.reprises[this.reprises.length - 1].player1 = null
      } else {
        this.player2.score -= this.reprises[this.reprises.length - 1].player2;
        this.reprises[this.reprises.length - 1].player2 = null
      }
    },
    newGame() {
      // Remise à zéro des scores
      this.player1.score = 0;
      this.player2.score = 0;

      // Remise à zéro des reprises
      this.reprises = [];

      // Remise à zéro des saisies en cours
      this.player1Input = '';
      this.player2Input = '';
      this.player1Negative = false;
      this.player2Negative = false;

      // Effacer les données sauvegardées
      this.clearGameData();
    },
        saveGameData() {
      // Debounce pour éviter de sauvegarder trop fréquemment
      clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => {
        try {
          const gameData = {
            player1: this.player1,
            player2: this.player2,
            player1Input: this.player1Input,
            player2Input: this.player2Input,
            player1Negative: this.player1Negative,
            player2Negative: this.player2Negative,
            reprises: this.reprises,
            lastSaved: new Date().toISOString()
          };

                    localStorage.setItem('scoreboard-game-data', JSON.stringify(gameData));
        } catch (error) {
          console.error('Erreur lors de la sauvegarde:', error);
        }
      }, 500); // Attendre 500ms avant de sauvegarder
    },
    loadGameData() {
      try {
        const savedData = localStorage.getItem('scoreboard-game-data');
        if (savedData) {
          const gameData = JSON.parse(savedData);

          // Valider la structure des données
          if (!gameData.player1 || !gameData.player2) {
            console.warn('Données sauvegardées incomplètes, réinitialisation');
            this.clearGameData();
            return;
          }

          // Restaurer les données
          this.player1 = { ...this.player1, ...gameData.player1 };
          this.player2 = { ...this.player2, ...gameData.player2 };
          this.player1Input = gameData.player1Input || '';
          this.player2Input = gameData.player2Input || '';
          this.player1Negative = gameData.player1Negative || false;
          this.player2Negative = gameData.player2Negative || false;

          this.reprises = Array.isArray(gameData.reprises) ? gameData.reprises : [];

          if (gameData.lastSaved) {
            console.log('Données de partie restaurées du', gameData.lastSaved);
          } else {
            console.log('Données de partie restaurées');
          }
        } else {
          console.log('Aucune donnée sauvegardée trouvée, nouvelle partie');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        // En cas d'erreur, effacer les données corrompues
        this.clearGameData();
      }
    },

    convertOldReprisesFormat(oldReprises) {
      // Convertir l'ancien format en nouveau format
      const newReprises = [];
      let player1Score = 0;
      let player2Score = 0;
      let currentRepriseNum = 0;

      // Grouper les séries par numéro de reprise
      const repriseGroups = {};
      oldReprises.forEach(serie => {
        const repriseNum = serie.reprise;
        if (!repriseGroups[repriseNum]) {
          repriseGroups[repriseNum] = [];
        }
        repriseGroups[repriseNum].push(serie);
      });

      // Recalculer les scores pour chaque reprise
      Object.keys(repriseGroups).sort((a, b) => parseInt(a) - parseInt(b)).forEach(repriseNum => {
        const series = repriseGroups[repriseNum];

        // Appliquer toutes les séries de cette reprise
        series.forEach(serie => {
          if (serie.player === 1) {
            player1Score += serie.value;
          } else {
            player2Score += serie.value;
          }
        });

        // Créer l'objet reprise avec les scores cumulés
        newReprises.push({
          player1: player1Score,
          player2: player2Score
        });
      });

      return newReprises;
    },
    clearGameData() {
      try {
        localStorage.removeItem('scoreboard-game-data');
        console.log('Données de partie effacées');
      } catch (error) {
        console.error('Erreur lors de l\'effacement:', error);
      }
    },
    swapPlayerNames() {
      const tempName = this.player1.name;
      this.player1.name = this.player2.name;
      this.player2.name = tempName;
    },
  }
}
</script>

<style scoped>
.scoreboard {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #2c3e50, #34495e);
  touch-action: manipulation;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  align-items: stretch;
}

.player-section {
  flex: 4 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 20px;
  border: 3px solid #34495e;
  box-sizing: border-box;
}

.left {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  color: #2c3e50;
}

.right {
  background: linear-gradient(135deg, #fd7e14, #e8590c);
}

.center-section {
  flex: 3 1 0;
  min-width: 0;
  background: linear-gradient(135deg, #34495e, #2c3e50);
  border-left: 3px solid #7f8c8d;
  border-right: 3px solid #7f8c8d;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
}



@media (max-width: 768px) {
  .scoreboard {
    flex-direction: column;
    align-items: stretch;
  }

  .player-section {
    flex: 0 0 35vh;
    min-width: auto;
    width: 100%;
    height: 35vh;
  }

  .center-section {
    flex: 1 1 auto;
    min-width: auto;
    width: 100%;
    border-left: none;
    border-right: none;
    border-top: 3px solid #7f8c8d;
    border-bottom: 3px solid #7f8c8d;
  }
}
</style>