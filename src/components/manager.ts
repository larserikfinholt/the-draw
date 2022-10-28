import { ref } from "vue";
import { loadAthletes } from "./athletesLoader";
import { IAthlete } from "./types";




export class Manager {

  public athletes:Array<IAthlete> =  [];
  public females:Array<IAthlete> =  [];

  constructor() {
    console.log("Creating manager");
  
  }

  public start() {
    this.athletes = loadAthletes();
  }


  public draw() {
    this.females.push(this.athletes.find(x=>x.gender=="F"));
  }


}
