import { ref } from "vue";
import { loadAthletes } from "./athletesLoader";
import { Gender, type IAthlete } from "./types";

export const TOTAL_SLOTS = 215;
const FEMALE_COUNT = Math.ceil((TOTAL_SLOTS * 15) / 100);
const MAX_MALE_COUNT = TOTAL_SLOTS - FEMALE_COUNT;
const MAX_NORWEGIAN_COUNT = Math.floor((TOTAL_SLOTS * 25) / 100);
const MAX_COUNTRY_COUNT = Math.floor((TOTAL_SLOTS * 10) / 100);

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
  public athletes: Array<IAthlete> = [];
  public lucky: Array<IAthlete> = [];

  public slots: number = TOTAL_SLOTS;

  public get grouping() {
    return groupBy(this.lucky, "country");
  }

  public get luckyFemales(): Array<IAthlete> {
    return this.lucky.filter((x) => x.gender == Gender.Female);
  }
  public get luckyMales(): Array<IAthlete> {
    return this.lucky.filter((x) => x.gender == Gender.Male);
  }

  constructor() {
    console.log("Creating manager");
  }

  public femaleDone: boolean = false;

  public startLoop() {
    setTimeout(() => {
      let gender = null;
      if (this.luckyMales.length >= MAX_MALE_COUNT) {
        gender = Gender.Female;
      }
      // Do the draw!
      this.draw(gender);
      if (this.lucky.length<TOTAL_SLOTS) {
         this.startLoop();
      }
    }, 400);
  }

  public start() {
    this.athletes = loadAthletes();
    console.log(this.athletes[0]);
  }

  public draw(gender: Gender | null): boolean {
    let array = this.athletes;
    if (gender != null) {
      array = this.athletes.filter((x) => x.gender == gender);
    }
    // Pick random athlete
    const randomAthlete = array[Math.floor(Math.random() * array.length)];

    if (this.verifiesAllRules(randomAthlete)) {
      // Add lucky
      this.lucky.push(randomAthlete);
      const indexToRemove = this.athletes.findIndex(
        (x) => x.id == randomAthlete.id
      );
      // remove from list
      this.athletes.splice(indexToRemove, 1);
      return true;
    }
    return false;
  }
  public verifiesAllRules(randomAthlete: IAthlete) {
    if (randomAthlete.country == "Norway") {
      // Max 25% from Norway
      if (
        this.lucky.filter((x) => x.country == "Norway").length >=
        MAX_NORWEGIAN_COUNT
      ) {
        return false;
      }
    } else if (
      this.lucky.filter((x) => x.country == randomAthlete.country).length >=
      MAX_COUNTRY_COUNT
    ) {
      // Max 10% from any country
      return false;
    }

    if (
      randomAthlete.gender == Gender.Male &&
      this.luckyMales.length >= MAX_MALE_COUNT
    ) {
      // Min 15% girls
      return false;
    }

    // lucky one
    return true;
  }

  public luckyAsCsv() {
    return this.lucky
      .map((row) => `${row.id}, ${row.country}, ${row.gender}`)
      .join("\r\n"); // rows starting on new lines
  }
}
