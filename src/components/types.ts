export interface IAthlete {
 id: number;
 athleteId: string;
 country:string;
 gender: Gender;
}

export enum Gender {
    Male,
    Female
}

