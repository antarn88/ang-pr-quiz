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
  tempQuestionId: number = 1000000;

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
    this.router.navigate(['/admin'], { state: this.quiz });
    this.tempDataService.clearTempQuestions();
  }

  saveTempQuestionsToDatabase(quizId: number): void {
    if (this.tempDataService.tempQuestions.length) {
      this.tempDataService.tempQuestions.map(tq => {
        tq.id = 0;
        this.insertQuestionToDatabase(tq, quizId);
      });
    }
  }

  async setQuizToDatabase(quiz: Quiz): Promise<any> {
    if (quiz.id === 0) {
      const newQuiz = await this.quizService.create(quiz).toPromise();
      this.saveTempQuestionsToDatabase(newQuiz.id);
    }
    else {
      this.saveTempQuestionsToDatabase(quiz.id);
      await this.quizService.update(quiz).toPromise();

      if (this.deletingQuestions.length) {
        this.deletingQuestions.forEach(deletingQuestionId => {

          const questionService = this.questionService;
          async function innerFunction() {
            await questionService.get(deletingQuestionId).toPromise();

            if (deletingQuestionId < 1000000) {
              await questionService.remove(deletingQuestionId).toPromise();
            }
          }
          innerFunction();
        });
      }
    }
    this.backToTheQuizList();
  }

  receiveIncomingQuestion(): void {
    const navigation = this.router.getCurrentNavigation();
    const incomingQuestion = navigation?.extras.state as Question;

    if (incomingQuestion?.question) {
      if (incomingQuestion.id === 0) {
        incomingQuestion.id = this.tempQuestionId++;
        this.tempDataService.addTempQuestion(incomingQuestion);
      }
      else {
        this.updateQuestionInDatabase(incomingQuestion);
      }
    }
  }

  async insertQuestionToDatabase(question: Question, quizId: number): Promise<any> {
    const newQuestion = await this.questionService.create(question).toPromise();
    const quiz = await this.quizService.get(quizId).toPromise();
    quiz.questions.push(newQuestion.id);
    await this.quizService.update(quiz).toPromise();
    this.getQuiz();
  }

  async updateQuestionInDatabase(question: Question): Promise<any> {
    if (question.id < 1000000) {
      await this.questionService.update(question).toPromise();
    }
  }

}
