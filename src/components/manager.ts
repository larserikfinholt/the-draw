import { ref } from "vue";
import { loadAthletes } from "./athletesLoader";
import { Gender, type IAthlete } from "./types";
import { ar } from "date-fns/locale";

export const TOTAL_SLOTS = 125;
const FEMALE_COUNT = Math.ceil((TOTAL_SLOTS * 17) / 100);
const MAX_MALE_COUNT = TOTAL_SLOTS - FEMALE_COUNT;
const MAX_NORWEGIAN_COUNT =  Math.floor((TOTAL_SLOTS * 25) / 100);
const MAX_COUNTRY_COUNT = 10000;// Math.floor((TOTAL_SLOTS * 15) / 100);
const THRESHOLD_TO_APPLY_MIN_COUNT_GIRLS_ = 500;
const MIN_COUNT_GIRLS_WHEN_COUNTRY_COUNT_ABOVE_THRESHOLD = Math.ceil((MAX_COUNTRY_COUNT * 10) / 100);

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
  public countriesWithMoreThanThresholdParticipants: Array<string> = [];
  public forceFemaleFromThisCOuntry: string | null = null;

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

  public startLoop(delay: number = 400) {
    setTimeout(() => {
      let gender = null;
      if (this.luckyMales.length >= MAX_MALE_COUNT) {
        gender = Gender.Female;
      }
      // Do the draw!
      this.draw(gender, this.forceFemaleFromThisCOuntry);
      if (this.lucky.length < TOTAL_SLOTS) {
        this.startLoop(delay);
      }
    }, delay); // Wait time to build up some excitement while we wait for the results
  }

  public start() {
    this.athletes = loadAthletes();
    console.log(this.athletes);
    const byCountry = groupBy(this.athletes, "country");

    Object.keys(byCountry).forEach((c) => {
      if (byCountry[c].length > THRESHOLD_TO_APPLY_MIN_COUNT_GIRLS_) {
        this.countriesWithMoreThanThresholdParticipants.push(c);
      }
    });

    console.log("Countries with special rules", this.countriesWithMoreThanThresholdParticipants);
  }

  public draw(gender: Gender | null, forceGirlFromCountry: string | null): boolean {
    let array = this.athletes;
    // Special case to ensure countries with many participants gets females
    if (forceGirlFromCountry != null) {
      array = this.athletes.filter((x) => x.country == forceGirlFromCountry && x.gender == Gender.Female);
    } else {
      // In case the overall gender is not fullfilled, limit to this gender
      if (gender != null) {
        array = this.athletes.filter((x) => x.gender == gender);
      }
    }
    // Pick random athlete
    const randomAthlete = array[Math.floor(Math.random() * array.length)];

    if (this.verifiesAllRules(randomAthlete)) {
      // Add lucky
      this.lucky.push(randomAthlete);
      const indexToRemove = this.athletes.findIndex((x) => x.id == randomAthlete.id);
      // remove from list
      this.athletes.splice(indexToRemove, 1);
      return true;
    }
    return false;
  }
  public verifiesAllRules(randomAthlete: IAthlete) {
    // We already have draw an athlete from this country, but the female quota is not fullfilled
    if (this.forceFemaleFromThisCOuntry == randomAthlete.country && randomAthlete.gender == Gender.Female) {
      this.forceFemaleFromThisCOuntry = null;
      return true;
    }

    if (randomAthlete.country == "Norwegian") {
      // Max 25% from Norway
      if (this.lucky.filter((x) => x.country == "Norwegian").length >= MAX_NORWEGIAN_COUNT) {
        return false;
      }
    } else if (this.lucky.filter((x) => x.country == randomAthlete.country).length >= MAX_COUNTRY_COUNT) {
      // Max 10% from any country
      return false;
    }

    if (randomAthlete.gender == Gender.Male && this.luckyMales.length >= MAX_MALE_COUNT) {
      // Min 17% girls
      return false;
    }

    // In case the country quota is almost full, and the country has many participants, ensure we get females from that country
    if (
      randomAthlete.gender == Gender.Male &&
      this.lucky.filter((x) => x.country == randomAthlete.country).length >= MAX_COUNTRY_COUNT - MIN_COUNT_GIRLS_WHEN_COUNTRY_COUNT_ABOVE_THRESHOLD &&
      this.countriesWithMoreThanThresholdParticipants.includes(randomAthlete.country) &&
      this.luckyFemales.filter((x) => x.country == randomAthlete.country).length < MIN_COUNT_GIRLS_WHEN_COUNTRY_COUNT_ABOVE_THRESHOLD
    ) {
      console.log(
        "To few females from country, forcing a female from this country",
        randomAthlete.country,
        this.luckyFemales.filter((x) => x.country == randomAthlete.country).length,
        this.athletes.filter((x) => x.country == randomAthlete.country && x.gender == Gender.Female).length
      );
      if (this.athletes.filter((x) => x.country == randomAthlete.country && x.gender == Gender.Female).length > 0) {
        // Apply the special rule
        this.forceFemaleFromThisCOuntry = randomAthlete.country;
      } else {
        // In the special case of no females from this country, just abandon the rule
        console.warn("No more athletes from this country - unable to fill females", randomAthlete.country);
      }

      return false;
    }

    // lucky one
    return true;
  }

  public luckyAsCsv() {
    return this.lucky.map((row) => `${row.id}, ${row.country}, ${row.gender}`).join("\r\n"); // rows starting on new lines
  }
}
