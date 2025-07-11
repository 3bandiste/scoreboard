<template>
  <div v-if="reprises.length > 0" class="recent-reprises">
    <h3>Dernières reprises</h3>
    <div class="reprises-table">
      <div class="table-header">
        <div class="col-reprise">Rep.</div>
        <div class="col-player1-header">{{ player1Name || 'Joueur 1' }}</div>
        <div class="col-player2-header">{{ player2Name || 'Joueur 2' }}</div>
      </div>
      <div class="table-subheader">
        <div class="col-reprise"></div>
        <div class="col-serie">Série</div>
        <div class="col-total">Total</div>
        <div class="col-serie">Série</div>
        <div class="col-total">Total</div>
      </div>
      <div class="table-body">
        <div v-for="(reprise, index) in reprisesWithTotal" :key="index" class="table-row">
          <div class="col-reprise">{{ reprise.number }}</div>
          <div class="col-serie" :class="getSeriesClass(reprise.player1.serie)">{{ reprise.player1.serie }}</div>
          <div class="col-total">{{ reprise.player1.total }}</div>
          <div class="col-serie" :class="getSeriesClass(reprise.player2.serie)">{{ reprise.player2.serie }}</div>
          <div class="col-total">{{ reprise.player2.total }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReprisesTable',
  props: {
    reprises: {
      type: Array,
      required: true,
      default: () => []
    },
    nbReprisesToShow: {
      type: Number,
      required: false,
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
  computed: {
    reprisesWithTotal() {
      const reprisesWithTotal = this.reprises.reduce((acc, reprise) => {
        const previousTotal1 = acc.length > 0 ? acc[acc.length - 1].player1.total : 0;
        const previousTotal2 = acc.length > 0 ? acc[acc.length - 1].player2.total : 0;

        const serie1 = reprise.player1 || 0;
        const serie2 = reprise.player2 || 0;

        acc.push({
          number: acc.length + 1,
          player1: {
            serie: this.formatSerie(serie1),
            total: serie1 + previousTotal1
          },
          player2: {
            serie: this.formatSerie(serie2),
            total: serie2 + previousTotal2
          }
        });
        return acc;
      }, []);
      return this.nbReprisesToShow ? reprisesWithTotal.slice(-this.nbReprisesToShow) : reprisesWithTotal;
    }
  },
  methods: {
    formatSerie(value) {
      if (value === null || value === 0) {
        return '-';
      } else if (value > 0) {
        return `+${value}`;
      } else {
        return value.toString();
      }
    },
    getSeriesClass(seriesValue) {
      if (seriesValue === '-' || seriesValue === '0') {
        return 'series-neutral';
      } else if (seriesValue.toString().startsWith('+')) {
        return 'series-positive';
      } else if (parseInt(seriesValue) < 0) {
        return 'series-negative';
      }
      return '';
    }
  }
}
</script>

<style scoped>
/* Styles pour le tableau des reprises */
.recent-reprises {
  margin-top: 20px;
  padding: 15px;
  background: rgba(0,0,0,0.8);
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  position: relative;
  z-index: 1;
}

.recent-reprises h3 {
  margin: 0 0 15px 0;
  font-size: 1.4rem;
  text-align: center;
  color: #f1c40f;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.reprises-table {
  font-size: 0.9rem;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 2fr 2fr;
  gap: 8px;
  padding: 8px;
  background: rgba(52, 73, 94, 0.8);
  border-radius: 5px 5px 0 0;
  margin-bottom: 0;
  font-weight: bold;
  color: #ecf0f1;
}

.table-subheader {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 8px;
  padding: 6px 8px;
  background: rgba(44, 62, 80, 0.6);
  margin-bottom: 5px;
  font-weight: bold;
  color: #bdc3c7;
  font-size: 0.85rem;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 8px;
  padding: 6px 8px;
  background: rgba(255,255,255,0.05);
  border-radius: 3px;
  margin-bottom: 2px;
  transition: background 0.2s;
}

.table-row:hover {
  background: rgba(255,255,255,0.1);
}

.col-reprise {
  text-align: center;
  font-weight: bold;
  color: #f1c40f;
}

.col-player1-header, .col-player2-header {
  text-align: center;
  font-weight: bold;
  color: #ecf0f1;
}

.col-serie {
  text-align: center;
  font-size: 0.85rem;
  font-weight: bold;
}

.col-total {
  text-align: center;
  font-weight: bold;
  color: #ecf0f1;
  font-size: 0.9rem;
}

.series-positive {
  color: #27ae60;
}

.series-negative {
  color: #e74c3c;
}

.series-neutral {
  color: #95a5a6;
}

@media (max-width: 768px) {
  .recent-reprises {
    padding: 10px;
    margin-top: 15px;
  }

  .recent-reprises h3 {
    font-size: 1.2rem;
  }

  .reprises-table {
    font-size: 0.8rem;
  }

  .table-header {
    grid-template-columns: 1fr 1.8fr 1.8fr;
  }

  .table-subheader, .table-row {
    grid-template-columns: 1fr 0.8fr 0.8fr 0.8fr 0.8fr;
    gap: 4px;
    padding: 4px;
  }

  .col-serie, .col-total {
    font-size: 0.75rem;
  }
}
</style>