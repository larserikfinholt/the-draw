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
  manager.value.startLoop(Gender.Female);
};

const drawBoys = () => {
  manager.value.startLoop(Gender.Male);
};


</script>

<template>
  <div>
    <div>In box: {{manager.athletes.length}}</div>
    <div>Girls: {{manager.luckyFemales.length}}</div>
    <div>Boys: {{manager.luckyMales.length}}</div>
    <div>Total: {{manager.lucky.length}}</div>
    

    <button @click="start()">Start</button>
    <button @click="drawGirls()">Draw Girls</button>
    <button @click="drawBoys()">Draw Boys</button>
    <div>
      <div v-for="(value, key) in manager.grouping" :key="key">
  {{ key }}: {{ value.length }}
</div>
</div>
    <hr/>
    {{manager.athletes}}
  </div>
</template>
