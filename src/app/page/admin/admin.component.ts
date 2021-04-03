import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Quiz } from 'src/app/model/quiz';
import { QuestionService } from 'src/app/service/question.service';
import { QuizService } from 'src/app/service/quiz.service';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  quizzes: Quiz[] = [];
  quizList$: BehaviorSubject<Quiz[]> = new BehaviorSubject<Quiz[]>([]);
  phrase: string = '';
  clickedColumn = 'id';
  sortingDirection = 'ASC';
  firstSorting = true;
  deletingQuestions: number[] = [];

  constructor(
    private quizService: QuizService,
    public questionService: QuestionService,
    private router: Router
  ) {
    this.receiveIncomingQuestion();
  }

  ngOnInit(): void {
    this.getQuizzes();
  }

  receiveIncomingQuestion(): void {
    const navigation = this.router.getCurrentNavigation();
    const incomingQuiz = navigation?.extras.state as Quiz;
    if (incomingQuiz) {
    }
  }

  async getQuestionFromQuestionId(questionId: number): Promise<string> {
    const question = await this.questionService.get(questionId).toPromise();
    return question.question;
  }

  async getQuizzes(): Promise<any> {
    this.quizService.getAll();
    this.quizService.getAllQuizzes();
    this.quizzes = [];
    await this.quizService.getAllQuizzes().then(list => {
      this.quizzes = list;
      this.quizList$.next(this.quizzes);
    });
    this.quizzes.forEach((quiz, quizIndex) => quiz.questions.map((question, questionIndex) => {
      this.getQuestionFromQuestionId(question).then(data => this.quizzes[quizIndex].questions[questionIndex] = data)
    }));
  }

  async onClickDelete(id: number): Promise<any> {
    if (confirm(`Are you sure to delete this quiz with: ${id} ID?`)) {
      const quiz = await this.quizService.get(id).toPromise();
      this.deletingQuestions = [];
      this.deletingQuestions = quiz.questions;

      const questionService = this.questionService;
      this.deletingQuestions.forEach(questionId => {
        async function removeQuestion() {
          await questionService.remove(questionId).toPromise();
        }
        removeQuestion();
      });

      await this.quizService.remove(id).toPromise();
      await this.getQuizzes();
      this.deletingQuestions = [];
    }
  }

  onChangePhrase(event: Event): void {
    this.phrase = (event.target as HTMLInputElement).value;
  }

  onClickTableHeader(columnName: string): void {
    this.clickedColumn = columnName;
    if (this.firstSorting) {
      this.sortingDirection = 'DESC';
      this.firstSorting = false;
    }
    else this.sortingDirection = this.sortingDirection === 'ASC' ? 'DESC' : 'ASC';
  }

}
