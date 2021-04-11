import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Quiz } from 'src/app/model/quiz';
import { QuestionService } from 'src/app/service/question.service';
import { QuizService } from 'src/app/service/quiz.service';
import { TempDataService } from 'src/app/service/temp-data.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  quizzes: Quiz[] = [];
  quizList$: BehaviorSubject<Quiz[]> = new BehaviorSubject<Quiz[]>([]);
  quizListWithQuestions$: BehaviorSubject<Quiz[]> = this.quizService.listWithQuestions$;
  phrase: string = '';
  clickedColumn = 'id';
  sortingDirection = 'ASC';
  firstSorting = true;
  deletingQuestions: number[] = [];

  constructor(
    private quizService: QuizService,
    public questionService: QuestionService,
    private router: Router,
    private tempDataService: TempDataService
  ) {
    this.receiveIncomingQuiz();
  }

  ngOnInit(): void {
    this.quizService.getAllWithQuestions();
  }

  receiveIncomingQuiz(): void {
    const navigation = this.router.getCurrentNavigation();
    const incomingQuiz = navigation?.extras.state as Quiz;
    if (incomingQuiz) {
    }
  }

  async onClickDelete(id: number): Promise<void> {
    if (confirm(`Are you sure to delete this quiz (ID: ${id}) with all its questions?`)) {
      const quiz = await this.quizService.get(id).toPromise();
      this.deletingQuestions = quiz.questions;
      for (let i = 0; i < this.deletingQuestions.length; i++) {
        const questionId = this.deletingQuestions[i];
        await this.questionService.remove(questionId).toPromise();
      }
      await this.quizService.remove(id).toPromise();
      this.quizService.getAllWithQuestions();
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

  onClickNewQuiz(): string[] {
    this.tempDataService.deleteNewQuizTempData();
    return ['quiz/0'];
  }

}
