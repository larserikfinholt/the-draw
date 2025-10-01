<script setup lang="ts">
import { computed } from "@vue/reactivity";
import { ref, onMounted } from "vue";
import { Manager } from "./manager";
import { Gender } from "./types";

const manager = ref(new Manager());
const skipDelay = ref(true); // Default is checked (skip delay)

// Load skipDelay state from localStorage on mount
onMounted(() => {
  const saved = localStorage.getItem('skipDelay');
  if (saved !== null) {
    skipDelay.value = JSON.parse(saved);
  }
});

// Save skipDelay state to localStorage when changed
const updateSkipDelay = () => {
  localStorage.setItem('skipDelay', JSON.stringify(skipDelay.value));
};

const start = () => {
  manager.value.start();
};
const drawAll = () => {
  const delay = skipDelay.value ? 5 : 400;
  manager.value.startLoop(delay);
};
const drawGirls = () => {
  const delay = skipDelay.value ? 5 : 400;
  manager.value.startLoop(delay);
};
const exportData = () => {
  const csv = manager.value.luckyAsCsv();
  downloadBlob(csv, "export.csv", "text/csv;charset=utf-8;");
};

const drawBoys = () => {
  const delay = skipDelay.value ? 5 : 400;
  manager.value.startLoop(delay);
};

const downloadBlob = (content: string, filename: string, contentType: string) => {
  // Create a blob
  var blob = new Blob([content], { type: contentType });
  var url = URL.createObjectURL(blob);

  // Create a link to download it
  var pom = document.createElement("a");
  pom.href = url;
  pom.setAttribute("download", filename);
  pom.click();
};

const asPercent = (count: number) => {
  return `${((count * 100) / manager.value.lucky.length).toFixed(2)}%`;
};
const asBoysVsGirsl = (country: string) => {
  const fromCountry = manager.value.lucky.filter(x=>x.country==country);
  return `${fromCountry.filter(x=>x.gender==Gender.Male).length}/${fromCountry.filter(x=>x.gender==Gender.Female).length}`;
};
</script>

<template>
  <div class="t-main">
    <div>In The Draw: {{ manager.athletes.length }}</div>
    <button :disabled="manager.athletes.length ? true : false" @click="start()">
      Load athletes
    </button>
    <button
      :disabled="manager.athletes.length == 0"
      @click="drawAll()"
    >
      Do the draw
    </button>
    <button :disabled="manager.lucky.length < 100" @click="exportData()">
      Export
    </button>
    <div style="display: flex;" class="t-data">
      <div style="flex:60%" class="t-small">
        <p class="lucky" v-for="(l, i) in manager.lucky" :key="i">
          {{ l.id }}{{ l.country }}{{ l.gender }},
        </p>
      </div>
      <div style="flex:40%">
        <div class="heading">Total Lucky: {{ manager.lucky.length }}</div>
        <div>
          Girls: {{ manager.luckyFemales.length }} ({{
            asPercent(manager.luckyFemales.length)
          }})
        </div>
        <div>
          Boys: {{ manager.luckyMales.length }} ({{
            asPercent(manager.luckyMales.length)
          }})
        </div>
        <div class="heading">Country distribution</div>
        <div v-for="(value, key) in manager.grouping" :key="key">
          {{ key }}: {{ value.length }} ({{asBoysVsGirsl(String(key))}}) ({{ asPercent(value.length) }} )
        </div>
        <div>
          <span v-if="manager.forceFemaleFromThisCOuntry">Looking for girl from {{ manager.forceFemaleFromThisCOuntry }}</span>
        </div>
      </div>
    </div>
    <div class="skip-delay-container">
      <label class="skip-delay-label">
        <input 
          type="checkbox" 
          v-model="skipDelay" 
          @change="updateSkipDelay"
        />
        Skip delay
      </label>
    </div>
  </div>
</template>

<style>
.t-data {
  display: flex;
  flex-direction: row;
}
.t-small {
  line-height: 80%;
}
.lucky {
  font-size: 12px;
  display: inline-block;
}
.heading {
  font-weight: bold;
  font-size: large;
}

body {
  background-color: #eee;
  color: #000;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  body {
    background-color: #1a1a1a;
    color: #ffffff;
  }
}

.skip-delay-container {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
}

.skip-delay-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
  /* background-color: rgba(255, 255, 255, 0.95);*/
  color: #333; 
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  /* border: 1px solid rgba(0, 0, 0, 0.1); */
  transition: all 0.2s ease;
}

.skip-delay-label:hover {
  background-color: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Dark mode for checkbox */
@media (prefers-color-scheme: dark) {
  .skip-delay-label {
    /* background-color: rgba(45, 45, 45, 0.95);
    color: #ffffff; */
    /* border: 1px solid rgba(255, 255, 255, 0.2); */
  }
  
  .skip-delay-label:hover {
    background-color: rgba(55, 55, 55, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
}

.skip-delay-label input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}
</style>
