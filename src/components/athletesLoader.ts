import { Gender, IAthlete } from "./types";
import csv from "./athletes.csv";

 

export const loadAthletes = (): Array<IAthlete> => {
  return csv.map((x) :IAthlete => {
    return {
      id: parseInt(x.Id),
      country: x.Country,
      gender: x.Gender=="F"?Gender.Female:Gender.Male
    };
  });
};


