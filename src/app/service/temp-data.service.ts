import { Injectable } from '@angular/core';
import { Question } from '../model/question';

@Injectable({
  providedIn: 'root'
})
export class TempDataService {

  tempId = 1000000;
  tempQuestions: Question[] = [];
  newQuizTempTitle = '';
  newQuizTempDescription = '';

  constructor() { }

  clearTempQuestions(): void {
    this.tempQuestions = [];
  }

  addTempQuestion(question: Question): void {
    question.id = this.tempId++;
    this.tempQuestions.push(question);
  }

  getTempQuestion(questionId: number): Question {
    return this.tempQuestions.filter(tq => tq.id === questionId)[0];
  }

  deleteTempQuestion(questionId: number): void {
    this.tempQuestions = this.tempQuestions.filter(tq => !(tq.id === questionId));
  }

  deleteNewQuizTempData(): void {
    this.newQuizTempTitle = '';
    this.newQuizTempDescription = '';
  }
}
