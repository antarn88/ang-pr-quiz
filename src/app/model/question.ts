import { Answer } from "./answer";

export class Question {
  id: number = 0;
  question: string = '';
  answers: Answer[] = [];
  points: number = 1;
  active: boolean = false;
}
