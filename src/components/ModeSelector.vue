<template>
  <div class="mode-selector-overlay" v-if="showModal">
    <div class="mode-selector-modal">
      <h2>Choisir le mode de jeu</h2>
      <div class="mode-options">
        <button
          @click="selectMode('carambole')"
          class="mode-btn carambole"
        >
          <h3>Carambole</h3>
          <p>Mode traditionnel avec pavé numérique</p>
        </button>
        <button
          @click="selectMode('casin')"
          class="mode-btn casin"
        >
          <h3>Casin</h3>
          <p>Mode avec boutons spécifiques et système de pattes</p>
        </button>
      </div>
      <button @click="cancel" class="cancel-btn">Annuler</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModeSelector',
  props: {
    showModal: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    selectMode(mode) {
      this.$emit('mode-selected', mode);
    },
    cancel() {
      this.$emit('cancel');
    }
  }
}
</script>

<style scoped>
.mode-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.mode-selector-modal {
  background: #2c3e50;
  border-radius: 20px;
  padding: 40px;
  max-width: 600px;
  width: 90%;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.mode-selector-modal h2 {
  color: #ecf0f1;
  margin-bottom: 30px;
  font-size: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.mode-options {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 30px;
}

.mode-btn {
  background: #34495e;
  border: 3px solid #3498db;
  border-radius: 15px;
  padding: 30px 20px;
  min-width: 200px;
  cursor: pointer;
  transition: all 0.3s;
  color: #ecf0f1;
}

.mode-btn:hover {
  background: #3498db;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
}

.mode-btn h3 {
  margin: 0 0 10px 0;
  font-size: 1.5rem;
}

.mode-btn p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
  line-height: 1.4;
}

.mode-btn.casin {
  border-color: #e67e22;
}

.mode-btn.casin:hover {
  background: #e67e22;
  box-shadow: 0 5px 15px rgba(230, 126, 34, 0.3);
}

.cancel-btn {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 15px 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: #c0392b;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .mode-options {
    flex-direction: column;
    align-items: center;
  }

  .mode-btn {
    width: 100%;
    max-width: 300px;
  }

  .mode-selector-modal {
    padding: 30px 20px;
  }

  .mode-selector-modal h2 {
    font-size: 1.5rem;
  }
}
</style>