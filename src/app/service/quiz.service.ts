import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Question } from '../model/question';
import { Quiz } from '../model/quiz';
import { BaseService } from './base.service';
import { QuestionService } from './question.service';

@Injectable({
  providedIn: 'root'
})
export class QuizService extends BaseService<Quiz> {

  listWithQuestions$: BehaviorSubject<Quiz[]> = new BehaviorSubject<Quiz[]>([]);

  constructor(
    public http: HttpClient,
    private questionService: QuestionService
  ) {
    super(http, 'quizzes');
  }

  async getAllWithQuestions(): Promise<void> {
    this.listWithQuestions$.next([]);
    const quizList = await this.http.get<Quiz[]>(`${this.serverAddress}/${this.entityName}`).toPromise();
    for (const quiz of quizList) {
      const quizQuestions: Question[] = [];
      const questionFromQuestionId = async (questionId: number) => await this.questionService.get(questionId).toPromise();
      for (let j = 0; j < quiz.questions.length; j++) {
        quiz.questions[j] = await questionFromQuestionId(quiz.questions[j]);
        quizQuestions.push(quiz.questions[j]);
      }
    }
    this.listWithQuestions$.next(quizList);
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    this.list$.next([]);
    const quizzes = await this.http.get<Quiz[]>(`${this.serverAddress}/${this.entityName}`).toPromise();
    this.list$.next(quizzes);
    return quizzes;
  }
}
