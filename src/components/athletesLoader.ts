import { Gender, type IAthlete } from "./types";
import csv from "./norseman_tickets_2026.csv";

console.log(csv);
 

export const loadAthletes = (): Array<IAthlete> => {
  console.log("First CSV row:", csv[0], csv[1], csv[2]);
  console.log("Available columns:", Object.keys(csv[0] || {}));


  return csv.map((x: any) :IAthlete => {
  // Handle the BOM character in the ticket number column name
    const ticketNumber = x["﻿Ticket number"] || x["Ticket number"];
    return {
      id: ticketNumber,
      athleteId: x.Userhash,
      country: x.Nationality,
      gender: x.Gender=="Female"?Gender.Female:Gender.Male
    };
  });
};


