<script setup lang="ts">
import { computed } from "@vue/reactivity";
import { ref } from "vue";
import { Manager } from "./manager";
import { Gender } from "./types";

const manager = ref(new Manager());

const start = () => {
  manager.value.start();
};
const drawAll = () => {
  manager.value.startLoop();
};
const drawGirls = () => {
  manager.value.startLoop();
};
const exportData = () => {
  const csv = manager.value.luckyAsCsv();
  downloadBlob(csv, "export.csv", "text/csv;charset=utf-8;");
};

const drawBoys = () => {
  manager.value.startLoop();
};

const downloadBlob = (content, filename, contentType) => {
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
</script>

<template>
  <div class="t-main">
    <div>In The Draw: {{ manager.athletes.length }}</div>
    <button :disabled="manager.athletes.length ? true : false" @click="start()">
      Load athletes
    </button>
    <button
      :disabled="manager.femaleDone || manager.athletes.length == 0"
      @click="drawGirls()"
    >
      Draw Girls
    </button>
    <button
      :disabled="
        !manager.femaleDone ||
        manager.athletes.length == 0 ||
        manager.lucky.length > 33
      "
      @click="drawBoys()"
    >
      Draw Boys
    </button>
    <button :disabled="manager.lucky.length < 100" @click="exportData()">
      Export
    </button>
    <div style="display: flex;" class="t-data">
      <div style="flex:70%" class="t-small">
        <p class="lucky" v-for="(l, i) in manager.lucky" :key="i">
          {{ l.id }}{{ l.country }}{{ l.gender }},
        </p>
      </div>
      <div style="flex:30%">
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
          {{ key }}: {{ value.length }} ({{ asPercent(value.length) }})
        </div>
      </div>
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
</style>
