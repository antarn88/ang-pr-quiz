import { Component, OnInit } from '@angular/core';
import { QuizService } from 'src/app/service/quiz.service';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Quiz } from 'src/app/model/quiz';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  quizList$ = this.quizService.list$;
  activeQuizList$: BehaviorSubject<Quiz[]> = new BehaviorSubject<Quiz[]>([]);

  constructor(private quizService: QuizService) { }

  async ngOnInit(): Promise<void> {
    this.quizService.getAll();
    const activeQuizzes$ = this.quizList$.pipe(map(quizlist => quizlist.filter(quizlist => quizlist.active)));
    activeQuizzes$.subscribe(activeQuizzes => this.activeQuizList$.next(activeQuizzes));
  }

}
