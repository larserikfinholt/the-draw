import { ref } from "vue";
import { loadAthletes } from "./athletesLoader";
import  { Gender, type IAthlete } from "./types";

const TOTAL_SLOTS = 215;
const FEMALE_COUNT = Math.ceil(TOTAL_SLOTS*15/100);
const MAX_MALE_COUNT = TOTAL_SLOTS-FEMALE_COUNT;
const MAX_NORWEGIAN_COUNT = Math.floor(TOTAL_SLOTS* 30/100);
const MAX_COUNTRY_COUNT = Math.floor(TOTAL_SLOTS*10/100);



function groupBy(arr, criteria) {
  const newObj = arr.reduce(function (acc, currentValue) {
    if (!acc[currentValue[criteria]]) {
      acc[currentValue[criteria]] = [];
    }
    acc[currentValue[criteria]].push(currentValue);
    return acc;
  }, {});
  return newObj;
}



export class Manager {

  public athletes:Array<IAthlete> =  [];
  public lucky:Array<IAthlete> =  [];

  

  public get grouping() {
      return groupBy(this.lucky,"country");
  }

  public get luckyFemales() : Array<IAthlete> {
    return this.lucky.filter(x=>x.gender==Gender.Female);
  }
  public get luckyMales() : Array<IAthlete> {
    return this.lucky.filter(x=>x.gender==Gender.Male);
  }

  constructor() {
    console.log("Creating manager");
  }

  public startLoop(){



    setTimeout(()=>{
      let gender = Gender.Male;
      if (this.luckyFemales.length<FEMALE_COUNT) {
        gender=Gender.Female;
      }


      this.draw(gender);
      this.startLoop();
    },100);
  }

  public start() {
    this.athletes = loadAthletes();
  }
  public draw(gender:Gender|null) :boolean {
    let array = this.athletes;
    if (gender!=null){
      array = this.athletes.filter(x=>x.gender==gender);
    }
    const randomAthlete = array[Math.floor(Math.random() * array.length)];

    if (this.verifiesAllRules(randomAthlete)){
      this.lucky.push(randomAthlete);
      const indexToRemove = this.athletes.findIndex(x=>x.id==randomAthlete.id);
      this.athletes.splice(indexToRemove,1);
      return true;
    }
    return false;
  }
  public verifiesAllRules(randomAthlete: IAthlete) {

    if (randomAthlete.country=="Norway"){
        if (this.lucky.filter(x=>x.country=="Norway").length>=MAX_NORWEGIAN_COUNT){
          return false;
        }
    } else if (this.lucky.filter(x=>x.country==randomAthlete.country).length>=MAX_COUNTRY_COUNT){
      return false;
    }

    if (randomAthlete.gender==Gender.Male && this.luckyMales.length>=MAX_MALE_COUNT) {
      return false;
    }

    // lucky one
    return true;
  }


}

