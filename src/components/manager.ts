import { ref } from "vue";
import {
  States,
} from "./types";



export class Manager {


  constructor() {
    console.log("Creating manager");
    const athletes = loadAthletes();
  }

}
