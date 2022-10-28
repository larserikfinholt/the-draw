<script setup lang="ts">
import { computed } from "@vue/reactivity";
import { ref } from "vue";
import { Manager } from "./manager";
import { getProcessName } from "./athletesLoader";
import { ManualActions, type IPart, type IStep } from "./types";

const manager = ref(new Manager());

const start = () => {
  manager.value.start();
};
const stop = () => {
  manager.value.stop();
};
const removeEmptyToIcz = () => {
  manager.value.manualAction(ManualActions.RemoveEmptyFromIzc);
}
const addFullToIcz = () => {
  manager.value.manualAction('a');
}


const parts = computed((): Array<IPart> => manager.value.parts);
</script>

<template>
  <div>
    <h1>{{manager.time.toLocaleTimeString()}}</h1>
    <button @click="start()">start</button
    ><button @click="stop()">stop</button> - Pending jobs {{ manager.pendingJobs }}
    <select v-model="manager.waitTime">
      <option value="1">1000x</option>
      <option value="10">100x</option>
      <option value="100">10x</option>
      <option value="1000">Sanntid</option>
    </select>

    <div v-for="part in parts">
      <h3>
        {{ part.state.name }} -
        {{ getProcessName(part.state.currentMainProcess) }}({{
          part.state.currentMainProcess
        }}) - {{ part.state.totalTicks }}
      </h3>
      <p>
        CurrentStep (steps: {{ part.state.currentStepNo }} of
        {{ part.state.currentSteps.length }}): -
        {{ part.state.currentStep?.step }} ({{ part.state.localTicks }} /
        {{ part.state.currentStep?.duration }})
      </p>
      <div v-if="part.state.name == 'Crane'">
        <div>iczEmpty1:{{ part.iczEmpty1 }} {{part.iczEmpty1Locked?'locked':''}}</div>
        <div>iczFull1:{{ part.iczFull1 }}  {{part.iczFull1Locked?'locked':''}}</div>
        <div>emptyArea1:{{ part.emptyArea1.length }}</div>
        <div>fullArea1: {{ part.fullArea1.length }}</div>
        <button @click="manager.manualAction(ManualActions.AddFullToIcz);">Add to ICZ</button>
        <button @click="manager.manualAction(ManualActions.RemoveEmptyFromIzc)">Remove from ICZ</button>
      </div>
      <div v-if="part.state.name == 'Ship'">
        <div>Docked: {{ part.docked ? "yes" : "no" }}</div>
        <div>FullContainers:{{ part.fullContainers.length }}</div>
        <div>EmptyContainers:{{ part.emptyContainers.length }}</div>
      </div>
      <!-- <ul>
      <li v-for="s of part.state.currentSteps">{{s.step}} {{s.duration}}</li>
    </ul> -->
    </div>
  </div>
</template>
