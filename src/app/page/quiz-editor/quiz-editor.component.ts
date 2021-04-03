import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Question } from 'src/app/model/question';
import { Quiz } from 'src/app/model/quiz';
import { QuestionService } from 'src/app/service/question.service';
import { QuizService } from 'src/app/service/quiz.service';
import { TempDataService } from 'src/app/service/temp-data.service';

@Component({
  selector: 'app-quiz-editor',
  templateUrl: './quiz-editor.component.html',
  styleUrls: ['./quiz-editor.component.scss']
})
export class QuizEditorComponent implements OnInit {

  quizId: number = 0;
  quiz: Quiz = new Quiz();
  questions: Question[] = [];
  deletingQuestions: number[] = [];
  
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private quizService: QuizService,
    private questionService: QuestionService,
    private tempDataService: TempDataService
  ) {
    this.receiveIncomingQuestion();
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => this.quizId = Number(params.id));
    this.getQuiz();
  }

  async getQuiz(): Promise<any> {
    if (this.quizId === 0) {
    }
    else {
      const quiz = await this.quizService.get(this.quizId).toPromise();
      this.quiz = quiz;
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = await this.questionService.get(quiz.questions[i]).toPromise();
        this.questions.push(question);
      }
      if (this.tempDataService.tempQuestions.length) {
        this.tempDataService.tempQuestions.forEach(tq => this.questions.push(tq));
      }
    }
  }

  deleteQuestion(questionId: number): void {
    const questionIndex = this.quiz.questions.findIndex(question => question === questionId);
    this.quiz.questions.splice(questionIndex, 1);
    const questionHTMLElement = document.querySelector(`#question-${questionId}`)?.parentElement;
    if (questionHTMLElement) questionHTMLElement.outerHTML = '';
    this.deletingQuestions.push(questionId);
    if (questionId >= 1000000) {
      this.tempDataService.deleteTempQuestion(questionId);
    }
  }

  backToTheQuizList(): void {
    this.deletingQuestions = [];
    this.router.navigate(['/admin']);
    this.tempDataService.clearTempQuestions();
  }

  setQuizToDatabase(quiz: Quiz): void {

    if (this.tempDataService.tempQuestions.length) {
      this.tempDataService.tempQuestions.map(tq => {
        tq.id = 0;
        this.insertQuestionToDatabase(tq);
      });
    }

    this.quizService.update(quiz).subscribe(
      () => {
        if (this.deletingQuestions.length) {
          this.deletingQuestions.forEach(deletingQuestionId => {
            this.questionService.get(deletingQuestionId).subscribe(
              () => {
                this.questionService.remove(deletingQuestionId).subscribe(
                  () =>
                    () => console.error('Error during deleting question!')
                );
              },
              () => console.error('You want to delete a question that does not exist!')
            );
          });
        }
        this.backToTheQuizList();
      },
      () => console.error('Error during updating quiz!')
    );
  }

  receiveIncomingQuestion(): void {
    const navigation = this.router.getCurrentNavigation();
    const incomingQuestion = navigation?.extras.state as Question;
    if (incomingQuestion?.question) {
      if (incomingQuestion.id === 0) {
        incomingQuestion.id = 100000;
        this.tempDataService.addTempQuestion(incomingQuestion);
      }
      else {
      }
    }
  }

  insertQuestionToDatabase(question: Question): void {
    this.questionService.create(question).subscribe(
      newQuestion => {
        this.quizService.get(this.quizId).subscribe(
          quiz => {
            quiz.questions.push(newQuestion.id);
            this.quizService.update(quiz).subscribe(
              () => this.getQuiz(),
              () => console.error('Error during updating quiz question array!')
            );
          },
          () => console.error('Error during adding questionId to Quiz question array!')
        );
      },
      () => console.error('Error during creating question!')
    );
  }

  updateQuestionInDatabase(question: Question): void {
    this.questionService.update(question).subscribe(
      () => { },
      () => console.error('Error during updating question!')
    );


  }

}
