import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Question } from 'src/app/model/question';
import { QuestionService } from 'src/app/service/question.service';
import { Location } from '@angular/common';
import { Answer } from 'src/app/model/answer';
import { TempDataService } from 'src/app/service/temp-data.service';

@Component({
  selector: 'app-question-editor',
  templateUrl: './question-editor.component.html',
  styleUrls: ['./question-editor.component.scss']
})
export class QuestionEditorComponent implements OnInit {

  questionId: number = 0;
  question: Question = new Question();
  quizId: number = 0;
  answerNumberArray: number[] = [0, 1, 2, 3];

  constructor(
    private activatedRoute: ActivatedRoute,
    private questionService: QuestionService,
    private router: Router,
    private location: Location,
    private tempDataService: TempDataService
  ) { }

  ngOnInit(): void {
    this.quizId = Number(this.location.path().split("/question")[0].split("/")
    [this.location.path().split("/question")[0].split("/").length - 1]);

    this.activatedRoute.params.subscribe(params => this.questionId = Number(params.id));
    this.getQuestion();
  }

  getQuestion(): void {
    if (this.questionId === 0) {
    }
    else if (this.questionId >= 1000000) {
      this.question = this.tempDataService.getTempQuestion(this.questionId);
    }
    else {
      this.questionService.get(this.questionId).subscribe(question => this.question = question);
    }
  }

  saveQuestion(question: Question): void {
    const answersArray: Answer[] = [];
    const answersGroups = document.querySelectorAll('.answer-group');
    answersGroups.forEach((answerGroup, index) => {
      const radioBtnChecked = (answerGroup.querySelector('.answer-radio') as HTMLInputElement).checked;
      const answer = (answerGroup.querySelector('.answers') as HTMLInputElement).value;
      const answerObject = { id: index + 1, content: answer, correct: radioBtnChecked };
      answersArray.push(answerObject);
    });
    question.answers = answersArray;
    this.backToTheQuizEditor();
  }

  backToTheQuizEditor(): void {
    this.router.navigate(['admin', 'quiz', `${this.quizId}`], { state: this.question });
  }

}
