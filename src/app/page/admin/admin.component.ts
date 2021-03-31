import { Component, OnInit } from '@angular/core';
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

  quizList$: BehaviorSubject<Quiz[]> = this.quizService.list$;
  phrase: string = '';
  clickedColumn = 'id';
  sortingDirection = 'ASC';
  firstSorting = true;

  constructor(
    private quizService: QuizService,
    public questionService: QuestionService
  ) { }

  ngOnInit(): void {
    this.quizService.getAll();
  }

  onClickEdit(quiz: Quiz): void {
  }

  onClickDelete(id: number): void {
    if (confirm(`Are you sure to delete this quiz with: ${id} ID?`)) {
      this.quizService.remove(id).subscribe(
        () => this.quizService.getAll(),
        () => console.error("Error during delete quiz!")
      );
    } 
  }

  onClickCreate(): void {
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
