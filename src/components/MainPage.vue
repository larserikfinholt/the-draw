<script setup lang="ts">
import { computed } from "@vue/reactivity";
import { ref } from "vue";
import { Manager } from "./manager";

const manager = ref(new Manager());



const start = () => {
  manager.value.start();
};
const draw = () => {
  manager.value.draw();
};
</script>

<template>
  <div>
    <div>Females: {{manager.females}}</div>
    <button @click="start()">Start</button>
    <button @click="draw()">Draw</button>
    123 {{manager.athletes}}
  </div>
</template>
