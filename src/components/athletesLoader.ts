import { Gender, type IAthlete } from "./types";
import csv from "./norseman_tickets_2026.csv";

console.log(csv);
 

export const loadAthletes = (): Array<IAthlete> => {
  return csv.map((x: any) :IAthlete => {
    return {
      id: x["Ticket number"],
      athleteId: x.Userhash,
      country: x.Nationality,
      gender: x.Gender=="Female"?Gender.Female:Gender.Male
    };
  });
};


