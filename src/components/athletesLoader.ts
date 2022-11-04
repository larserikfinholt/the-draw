import { Gender, IAthlete } from "./types";
import csv from "./norseman_ballot.csv";

console.log(csv);
 

export const loadAthletes = (): Array<IAthlete> => {
  return csv.map((x) :IAthlete => {
    return {
      id: x.Ticketnumber,
      country: x.Nationality,
      gender: x.Gender=="Female"?Gender.Female:Gender.Male
    };
  });
};


