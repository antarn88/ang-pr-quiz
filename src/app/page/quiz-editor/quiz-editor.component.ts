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
    public tempDataService: TempDataService
  ) {
    this.receiveIncomingQuestion();
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => this.quizId = Number(params.id));
    this.getQuiz();
  }

  async getQuiz(): Promise<void> {
    if (this.quizId === 0) {
      if (this.tempDataService.tempQuestions.length) {
        this.tempDataService.tempQuestions.forEach(tq => this.questions.push(tq));
      }
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
    const questionIndex = this.questions.findIndex(question => question.id === questionId);
    this.questions.splice(questionIndex, 1);
    const questionHTMLElement = document.querySelector(`#question-${questionId}`)?.parentElement;
    if (questionHTMLElement) questionHTMLElement.outerHTML = '';
    this.deletingQuestions.push(questionId);
    if (questionId >= 1000000) {
      this.tempDataService.deleteTempQuestion(questionId);
    }
  }

  backToTheQuizList(): void {
    this.quizService.listWithQuestions$.next([]);
    this.deletingQuestions = [];
    this.router.navigate(['/admin'], { state: this.quiz });
    this.tempDataService.clearTempQuestions();
  }

  addQuestionToQuizObject(questionId: number): void {
    this.quiz.questions.push(questionId);
  }

  async saveTempQuestionsToDatabase(): Promise<void> {
    for (let i = 0; i < this.tempDataService.tempQuestions.length; i++) {
      const tq = this.tempDataService.tempQuestions[i];
      tq.id = 0;
      const newQuestion = await this.questionService.create(tq).toPromise();
      this.quiz.questions.push(newQuestion.id);
    }
  }

  async updateQuiz(quiz: Quiz): Promise<void> {
    await this.quizService.update(quiz).toPromise();
  }

  async setQuizToDatabase(quiz: Quiz): Promise<void> {
    if (quiz.id === 0) {
      this.storeTempDataForNewQuiz();
      await this.saveTempQuestionsToDatabase();
      await this.quizService.create(quiz).toPromise();
      this.tempDataService.clearTempQuestions();
      this.deleteQuestionFromDatabase();
    }
    else {
      if (this.tempDataService.tempQuestions.length) {
        await this.saveTempQuestionsToDatabase();
        await this.updateQuiz(this.quiz);
        this.tempDataService.clearTempQuestions();
        this.deleteQuestionFromDatabase();
      } else {
        this.deleteQuestionFromDatabase();
      }
    }
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

  async insertQuestionToDatabase(question: Question): Promise<any> {
    const newQuestion: Question = await this.questionService.create(question).toPromise();
    this.quiz.questions.push(newQuestion.id);
  }

  async updateQuestionInDatabase(question: Question): Promise<any> {
    if (question.id < 1000000) {
      await this.questionService.update(question).toPromise();
    }
  }

  async deleteQuestionFromDatabase(): Promise<void> {
    if (this.deletingQuestions.length) {
      for (let i = 0; i < this.deletingQuestions.length; i++) {
        const deletingQuestionId = this.deletingQuestions[i];
        if (deletingQuestionId < 1000000) {
          await this.questionService.remove(deletingQuestionId).toPromise();
          this.questions = this.questions.filter(question => question.id !== deletingQuestionId);
          this.quiz.questions = this.quiz.questions.filter(questionId => questionId !== deletingQuestionId);
          await this.updateQuiz(this.quiz);
        }
      }
      this.backToTheQuizList();
    }
    else {
      this.backToTheQuizList();
    }
  }

  storeTempDataForNewQuiz(): void {
    this.quiz.title = this.tempDataService.newQuizTempTitle;
    this.quiz.description = this.tempDataService.newQuizTempDescription;
    this.tempDataService.deleteNewQuizTempData();
  }

  isValidForm(): boolean {
    return this.questions.length ? true : false;
  }

}
