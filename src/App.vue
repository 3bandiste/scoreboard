<template>
  <div class="scoreboard">
    <!-- Sélecteur de mode -->
    <ModeSelector
      :showModal="showModeSelector"
      @mode-selected="onModeSelected"
      @cancel="showModeSelector = false"
    />

    <!-- Mode Carambole -->
    <template v-if="gameMode === 'carambole'">
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
          @auto-validate-start="startAutoValidateProgress(1)"
          @auto-validate-stop="stopAutoValidateProgress(1)"
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
          :auto-validate-progress="autoValidateProgress"
          :auto-validate-active="autoValidateActive"
          @increment-reprise="incrementReprise"
          @decrement-reprise="decrementReprise"
          @new-game="showNewGameModal"
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
          @auto-validate-start="startAutoValidateProgress(2)"
          @auto-validate-stop="stopAutoValidateProgress(2)"
        />
      </div>
    </template>

    <!-- Mode Casin -->
    <template v-if="gameMode === 'casin'">
      <!-- Joueur 1 - Gauche -->
      <div class="player-section left">
        <PlayerScoreCasin
          ref="playerScoreCasin1"
          :player="player1"
          :is-player1="true"
          @update-name="updatePlayerName(1, $event)"
          @update-pattes="updatePlayerPattes(1, $event)"
          @shot-added="onShotAdded(1, $event)"
          @victory-achieved="onVictoryAchieved(1)"
          @reset-scores="resetPlayerScores(1)"
        />
      </div>

      <!-- Centre - Affichage Casin -->
      <div class="center-section casin">
        <ReprisesDisplayCasin
          :recent-shots="recentShots"
          :can-undo="canUndo"
          @new-game="showNewGameModal"
          @swap-names="swapPlayerNames"
          @undo-last-action="undoLastAction"
        />
      </div>

      <!-- Joueur 2 - Droite -->
      <div class="player-section right">
        <PlayerScoreCasin
          ref="playerScoreCasin2"
          :player="player2"
          :is-player1="false"
          @update-name="updatePlayerName(2, $event)"
          @update-pattes="updatePlayerPattes(2, $event)"
          @shot-added="onShotAdded(2, $event)"
          @victory-achieved="onVictoryAchieved(2)"
          @reset-scores="resetPlayerScores(2)"
        />
      </div>
    </template>

    <!-- InstallPrompt -->
    <InstallPrompt />
  </div>
</template>

<script>
import PlayerScore from './components/PlayerScore.vue'
import ReprisesDisplay from './components/ReprisesDisplay.vue'
import InstallPrompt from './components/InstallPrompt.vue'
import ModeSelector from './components/ModeSelector.vue'
import PlayerScoreCasin from './components/PlayerScoreCasin.vue'
import ReprisesDisplayCasin from './components/ReprisesDisplayCasin.vue'

export default {
  name: 'App',
  components: {
    PlayerScore,
    ReprisesDisplay,
    InstallPrompt,
    ModeSelector,
    PlayerScoreCasin,
    ReprisesDisplayCasin
  },
  data() {
    return {
      player1: {
        id: 'player1',
        name: 'Joueur 1',
        currentSeries: 0,
        pattes: 5,
        shots: [],
        sets: []
      },
      player2: {
        id: 'player2',
        name: 'Joueur 2',
        currentSeries: 0,
        pattes: 5,
        shots: [],
        sets: []
      },
      player1Input: '',
      player2Input: '',
      player1Negative: false,
      player2Negative: false,
      autoValidateProgress: 0,
      autoValidateActive: false,
      reprises: [],
      saveTimeout: null,
      progressInterval: null,
      gameMode: 'carambole', // 'carambole' or 'casin'
      showModeSelector: false,
      totalSets: 0,
      gameTime: 0,
      recentShots: [],
      canUndo: false,
      gameStartTime: null,
      gameTimer: null
    }
  },
  mounted() {
    // Attendre que le DOM soit complètement chargé
    this.$nextTick(() => {
      // Petite pause pour éviter les conflits avec le service worker
      setTimeout(() => {
        const hasData = this.loadGameData();
        // Afficher le sélecteur de mode au démarrage si pas de données sauvegardées
        if (!hasData) {
          this.showModeSelector = true;
        }
      }, 100);
    });
  },
  beforeUnmount() {
    // Nettoyer le timeout de sauvegarde
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    // Nettoyer l'interval de progression
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    // Nettoyer le timer de jeu
    this.stopGameTimer();
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
    gameMode() {
      this.saveGameData();
    },
    recentShots: {
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
      // Afficher le sélecteur de mode pour une nouvelle partie
      this.showModeSelector = true;
    },

    resetGame() {
      // Arrêter le timer de jeu
      this.stopGameTimer();

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

      // Remise à zéro des données casin
      this.totalSets = 0;
      this.gameTime = 0;
      this.recentShots = [];
      this.canUndo = false;

      // Réinitialiser les données joueurs pour le casin
      this.player1.pattes = 5;
      this.player1.shots = [];
      this.player1.sets = [];
      this.player2.pattes = 5;
      this.player2.shots = [];
      this.player2.sets = [];

      // Réinitialiser les scores des composants PlayerScoreCasin si en mode casin
      if (this.gameMode === 'casin') {
        this.$nextTick(() => {
          if (this.$refs.playerScoreCasin1) {
            this.$refs.playerScoreCasin1.resetAllScores();
          }
          if (this.$refs.playerScoreCasin2) {
            this.$refs.playerScoreCasin2.resetAllScores();
          }
        });
      }

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
            gameMode: this.gameMode,
            recentShots: this.recentShots,
            canUndo: this.canUndo,
            gameTime: this.gameTime,
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

          // Restaurer les données de base
          this.player1 = { ...this.player1, ...gameData.player1 };
          this.player2 = { ...this.player2, ...gameData.player2 };
          this.player1Input = gameData.player1Input || '';
          this.player2Input = gameData.player2Input || '';
          this.player1Negative = gameData.player1Negative || false;
          this.player2Negative = gameData.player2Negative || false;
          this.reprises = Array.isArray(gameData.reprises) ? gameData.reprises : [];

          // Restaurer les données de mode
          this.gameMode = gameData.gameMode || 'carambole';
          this.recentShots = Array.isArray(gameData.recentShots) ? gameData.recentShots : [];
          this.canUndo = gameData.canUndo || false;
          this.gameTime = gameData.gameTime || 0;

          // Redémarrer le timer si en mode casin et qu'il y a du temps
          if (this.gameMode === 'casin' && this.gameTime > 0) {
            this.startGameTimer();
          }

          if (gameData.lastSaved) {
            console.log('Données de partie restaurées du', gameData.lastSaved);
          } else {
            console.log('Données de partie restaurées');
          }

          // Si on a des données sauvegardées, ne pas afficher le sélecteur de mode
          return true;
        } else {
          console.log('Aucune donnée sauvegardée trouvée, nouvelle partie');
          return false;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        // En cas d'erreur, effacer les données corrompues
        this.clearGameData();
        return false;
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
        // Effacer aussi les scores du mode casin
        localStorage.removeItem('casinScores_player1');
        localStorage.removeItem('casinScores_player2');
        console.log('Données de partie effacées');
      } catch (error) {
        console.error('Erreur lors de l\'effacement:', error);
      }
    },
    startAutoValidateProgress(playerNum) {
      this.autoValidateActive = true;
      this.autoValidateProgress = 0;

      // Animer la progression sur 3 secondes
      const progressInterval = setInterval(() => {
        this.autoValidateProgress += 1;
        if (this.autoValidateProgress >= 100) {
          clearInterval(progressInterval);
        }
      }, 30); // 30ms * 100 = 3000ms (3 secondes)

      // Stocker l'interval pour pouvoir l'arrêter
      this.progressInterval = progressInterval;
    },
    stopAutoValidateProgress(playerNum) {
      this.autoValidateActive = false;
      this.autoValidateProgress = 0;

      // Arrêter l'animation de progression
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }
    },
    swapPlayerNames() {
      const tempName = this.player1.name;
      this.player1.name = this.player2.name;
      this.player2.name = tempName;
    },
              onModeSelected(mode) {
       this.gameMode = mode;
       this.showModeSelector = false;
       this.resetGame(); // Reset game data when mode changes

       // Démarrer le timer pour le mode casin
       if (mode === 'casin') {
         this.startGameTimer();
         // Recharger les scores du mode casin si les composants existent
         this.$nextTick(() => {
           if (this.$refs.playerScoreCasin1) {
             this.$refs.playerScoreCasin1.loadCasinScores();
           }
           if (this.$refs.playerScoreCasin2) {
             this.$refs.playerScoreCasin2.loadCasinScores();
           }
         });
       }
     },
     showNewGameModal() {
       this.showModeSelector = true;
     },
     updatePlayerPattes(playerNum, pattes) {
       if (playerNum === 1) {
         this.player1.pattes = pattes;
       } else {
         this.player2.pattes = pattes;
       }
     },
     onShotAdded(playerNum, shotType) {
       const shot = {
         player: playerNum,
         playerName: playerNum === 1 ? this.player1.name : this.player2.name,
         type: shotType,
         timestamp: Date.now()
       };
       this.recentShots.push(shot);
       this.canUndo = true;
     },
     onVictoryAchieved(playerNum) {
       const playerName = playerNum === 1 ? this.player1.name : this.player2.name;
       console.log(`Victory achieved by player ${playerNum}: ${playerName}`);

       // Arrêter le timer
       this.stopGameTimer();

       // Optionnel : ajouter une notification de victoire
       this.$emit('game-won', {
         player: playerNum,
         playerName,
         gameTime: this.gameTime
       });
     },
     resetPlayerScores(playerNum) {
       console.log(`Resetting scores for player ${playerNum}`);
     },
     undoLastAction() {
       if (this.gameMode === 'casin') {
         // En mode casin, annuler le dernier coup du dernier joueur qui a joué
         if (this.recentShots.length > 0) {
           const lastShot = this.recentShots[this.recentShots.length - 1];
           if (lastShot.player === 1 && this.$refs.playerScoreCasin1) {
             this.$refs.playerScoreCasin1.undoLastShot();
           } else if (lastShot.player === 2 && this.$refs.playerScoreCasin2) {
             this.$refs.playerScoreCasin2.undoLastShot();
           }
           this.recentShots.pop();
           this.canUndo = this.recentShots.length > 0;
         }
       } else {
         // Mode carambole (comportement existant)
         if (this.recentShots.length > 0) {
           this.recentShots.pop();
           this.canUndo = this.recentShots.length > 0;
         }
       }
     },
     startGameTimer() {
       this.gameStartTime = Date.now();
       this.gameTimer = setInterval(() => {
         this.gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
       }, 1000);
     },
     stopGameTimer() {
       if (this.gameTimer) {
         clearInterval(this.gameTimer);
         this.gameTimer = null;
       }
     }
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

.center-section.casin {
  flex: 1 1 0;
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