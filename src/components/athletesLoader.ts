import { Gender, type IAthlete } from "./types";
import csv from "./norseman_tickets_2027.csv";

console.log(csv);
 

export const loadAthletes = (): Array<IAthlete> => {
  return csv.map((x: any) :IAthlete => {
    return {
      // Export file may start with a UTF-8 BOM, which ends up in the first column name
      id: x["Ticket number"] ?? x["\uFEFFTicket number"],
      athleteId: x.Userhash,
      country: x.Nationality,
      gender: x.Gender == "Female" || x.Gender == "Kvinna" ? Gender.Female : Gender.Male
    };
  });
};


