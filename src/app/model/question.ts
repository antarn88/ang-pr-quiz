import { Answer } from './answer';

export class Question {
  id = 0;
  question = '';
  answers: Answer[] = [];
  points = 1;
  active = true;
}
