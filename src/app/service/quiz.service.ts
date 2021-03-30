import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Quiz } from '../model/quiz';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class QuizService extends BaseService<Quiz> {

  constructor(public http: HttpClient) {
    super(http, 'quizzes');
  }
}
