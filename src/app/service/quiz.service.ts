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
    const quizListWithQuestions = quizList.map(quiz => {
      const questionFromQuestionId = async (questionId: number) => await this.questionService.get(questionId).toPromise();
      const quizQuestions$ = quiz.questions.map(question => question = questionFromQuestionId(question));
      const quizQuestions: Question[] = [];
      quizQuestions$.forEach(quizQ => quizQ.then(data => quizQuestions.push(data)));
      quiz.questions = quizQuestions;
      return quiz;
    });
    this.listWithQuestions$.next(quizListWithQuestions);
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    this.list$.next([]);
    const quizzes = await this.http.get<Quiz[]>(`${this.serverAddress}/${this.entityName}`).toPromise();
    this.list$.next(quizzes);
    return quizzes;
  }
}
