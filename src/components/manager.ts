import { ref } from "vue";
import { loadAthletes } from "./athletesLoader";
import { Gender, type IAthlete } from "./types";
import { ar } from "date-fns/locale";

export const TOTAL_SLOTS = 125;
const MIN_FEMALE_PERCENTAGE = 15; // 15% minimum
const MAX_FEMALE_PERCENTAGE = 15.5; // 15.5% maximum
const FEMALE_COUNT_MIN = Math.ceil((TOTAL_SLOTS * MIN_FEMALE_PERCENTAGE) / 100);
const FEMALE_COUNT_MAX = Math.floor((TOTAL_SLOTS * MAX_FEMALE_PERCENTAGE) / 100);
const MAX_MALE_COUNT = TOTAL_SLOTS - FEMALE_COUNT_MIN;
const MAX_NORWEGIAN_COUNT =  Math.floor((TOTAL_SLOTS * 25) / 100);
const MAX_COUNTRY_COUNT = Math.floor((TOTAL_SLOTS * 15) / 100); // 18 slots max per country (15% of 125)
const THRESHOLD_TO_APPLY_MIN_COUNT_GIRLS_ = 100; // Lower threshold - countries with >100 participants get special female rules
const MIN_COUNT_GIRLS_WHEN_COUNTRY_COUNT_ABOVE_THRESHOLD = 2; // Minimum 2 females from large countries

function groupBy(arr: any[], criteria: string) {
  const newObj = arr.reduce(function (acc: any, currentValue: any) {
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
  public drawnAthleteIds: Set<string> = new Set();

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

  private attemptCounter = 0;
  private maxAttempts = 10000; // Prevent infinite loops

  public startLoop(delay: number = 400) {
    setTimeout(() => {
      let gender = null;
      if (this.luckyMales.length >= MAX_MALE_COUNT) {
        gender = Gender.Female;
      }
      
      // Do the draw!
      const success = this.draw(gender, this.forceFemaleFromThisCOuntry);
      
      if (!success) {
        this.attemptCounter++;
        if (this.attemptCounter > this.maxAttempts) {
          console.error("Maximum attempts reached, stopping draw to prevent infinite loop");
          console.log("Final results:", this.lucky.length, "out of", TOTAL_SLOTS);
          return;
        }
      } else {
        this.attemptCounter = 0; // Reset counter on successful draw
      }
      
      if (this.lucky.length < TOTAL_SLOTS && this.athletes.length > 0) {
        this.startLoop(delay);
      } else if (this.athletes.length === 0) {
        console.log("No more athletes available, draw complete with", this.lucky.length, "participants");
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
      // Safety check: if no females available from this country, abandon the force rule
      if (array.length === 0) {
        console.warn("No females available from forced country, abandoning rule:", forceGirlFromCountry);
        this.forceFemaleFromThisCOuntry = null;
        return false;
      }
    } else {
      // In case the overall gender is not fullfilled, limit to this gender
      if (gender != null) {
        array = this.athletes.filter((x) => x.gender == gender);
      }
    }
    
    // Safety check: if no athletes available in filtered array, return false
    if (array.length === 0) {
      return false;
    }
    
    // Pick random athlete
    const randomAthlete = array[Math.floor(Math.random() * array.length)];

    if (this.verifiesAllRules(randomAthlete)) {
      // Add lucky
      this.lucky.push(randomAthlete);
      // Track that this athlete has been drawn
      this.drawnAthleteIds.add(randomAthlete.athleteId);
      const indexToRemove = this.athletes.findIndex((x) => x.id == randomAthlete.id);
      // remove from list
      this.athletes.splice(indexToRemove, 1);
      return true;
    }
    return false;
  }
  public verifiesAllRules(randomAthlete: IAthlete) {
    // Check if this athlete has already been drawn (prevent duplicate athletes)
    if (this.drawnAthleteIds.has(randomAthlete.athleteId)) {
      return false;
    }

    // Add female maximum check - prevent going above intended percentage
    if (randomAthlete.gender == Gender.Female && this.luckyFemales.length >= FEMALE_COUNT_MAX) {
      return false;
    }

    // Check Norwegian quota first - this applies to all Norwegian athletes regardless of other rules
    if (randomAthlete.country == "Norwegian") {
      // Max 25% from Norwegian
      if (this.lucky.filter((x) => x.country == "Norwegian").length >= MAX_NORWEGIAN_COUNT) {
        return false;
      }
    } else if (this.lucky.filter((x) => x.country == randomAthlete.country).length >= MAX_COUNTRY_COUNT) {
      // Max 10% from any country
      return false;
    }

    // We already have draw an athlete from this country, but the female quota is not fullfilled
    if (this.forceFemaleFromThisCOuntry == randomAthlete.country && randomAthlete.gender == Gender.Female) {
      this.forceFemaleFromThisCOuntry = null;
      return true;
    }

    if (randomAthlete.gender == Gender.Male && this.luckyMales.length >= MAX_MALE_COUNT) {
      // Min 17% girls
      return false;
    }

    // In case we're selecting from a large country, ensure we get a minimum number of females
    if (
      randomAthlete.gender == Gender.Male &&
      this.countriesWithMoreThanThresholdParticipants.includes(randomAthlete.country) &&
      this.luckyFemales.filter((x) => x.country == randomAthlete.country).length < MIN_COUNT_GIRLS_WHEN_COUNTRY_COUNT_ABOVE_THRESHOLD &&
      this.lucky.filter((x) => x.country == randomAthlete.country).length >= MIN_COUNT_GIRLS_WHEN_COUNTRY_COUNT_ABOVE_THRESHOLD &&
      this.luckyFemales.length < FEMALE_COUNT_MAX // Only boost females if we haven't hit the maximum
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
    return this.lucky.map((row) => `${row.athleteId}, ${row.id}, ${row.country}, ${row.gender}`).join("\r\n"); // rows starting on new lines
  }
}
