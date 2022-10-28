import { MainProcesses, type IStep } from "./types";
import csv from "./athletes.csv";

export const loadAthletes = (): Array<IStep> => {
  return csv.map((x) :IStep => {
    return {
      id: parseInt(x.id),
      duration: parseInt(x.duration),
      frequency:0,
      mainProcess:x.mainProcess,
      order:x.order,
      step:x.step
    };
  });
};

const all = loadGenericProcesses();

