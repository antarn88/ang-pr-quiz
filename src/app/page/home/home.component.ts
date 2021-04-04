import { Component, OnInit } from '@angular/core';
import { QuizService } from 'src/app/service/quiz.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  quizList$ = this.quizService.list$;

  constructor(private quizService: QuizService) { }

  ngOnInit(): void {
    this.quizService.getAll();
  }

}
