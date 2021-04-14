import { AfterContentChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
export class QuestionEditorComponent implements OnInit, AfterContentChecked {

  questionId: number = 0;
  question: Question = new Question();
  quizId: number = 0;
  answerNumberArray: number[] = [0, 1, 2, 3];
  selectedRadio: boolean = false;
  backupQuestion: Question = new Question();

  constructor(
    private activatedRoute: ActivatedRoute,
    private questionService: QuestionService,
    private router: Router,
    private location: Location,
    private tempDataService: TempDataService,
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterContentChecked(): void {
    this.isValid();
    this.cdr.detectChanges();
  }

  async ngOnInit(): Promise<void> {
    this.quizId = Number(this.location.path().split("/question")[0].split("/")
    [this.location.path().split("/question")[0].split("/").length - 1]);

    this.activatedRoute.params.subscribe(params => this.questionId = Number(params.id));
    await this.getQuestion();
    this.backupQuestion = JSON.parse(JSON.stringify({ ...this.question }));
  }

  async getQuestion(): Promise<void> {
    if (this.questionId === 0) {
    }
    else if (this.questionId >= 1000000) {
      this.question = this.tempDataService.getTempQuestion(this.questionId);
      this.selectedRadio = true;
    }
    else {
      this.question = await this.questionService.get(this.questionId).toPromise();
      this.selectedRadio = true;
    }
  }

  saveOrCreateQuestion(question: Question): void {
    const answersArray: Answer[] = [];
    const answersGroups = document.querySelectorAll('.answer-group');
    answersGroups.forEach((answerGroup, index) => {
      const radioBtnChecked = (answerGroup.querySelector('.answer-radio') as HTMLInputElement).checked;
      const answer = (answerGroup.querySelector('.answers') as HTMLInputElement).value;
      const answerObject = { id: index + 1, content: answer, correct: radioBtnChecked };
      answersArray.push(answerObject);
    });
    question.answers = answersArray;
    this.question = question;
    this.backToTheQuizEditor('submit');
  }

  backToTheQuizEditor(parentMethod: string): void {
    if (parentMethod === 'cancel') {
      if (this.question.id === 0) {
        this.question = new Question();
      }
      else if (this.question.id >= 1000000) {
        this.tempDataService.tempQuestions = this.tempDataService.tempQuestions
          .map(tq => tq.id === this.question.id ? tq = this.backupQuestion : tq);
      }
      else {
        this.question = this.backupQuestion;
      }
    }
    this.router.navigate(['admin', 'quiz', `${this.quizId}`], { state: this.question });
  }

  isValid(): boolean {
    const answers = Array.from(document.querySelectorAll('.answers'));
    const allAnswersFilledOut = answers.every(answer => (answer as HTMLInputElement).value !== '');
    return allAnswersFilledOut && this.selectedRadio;
  }

  onClickRadio(): void {
    this.selectedRadio = true;
    this.isValid();
  }

}
