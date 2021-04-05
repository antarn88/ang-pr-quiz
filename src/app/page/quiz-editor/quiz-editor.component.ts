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
      const quiz: Quiz = await this.quizService.get(this.quizId).toPromise();
      this.quiz = quiz;
      for (let i = 0; i < quiz.questions.length; i++) {
        const question: Question = await this.questionService.get(quiz.questions[i]).toPromise();
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

  async backToTheQuizList(): Promise<any> {
    this.quizService.listWithQuestions$.next([]);
    this.deletingQuestions = [];
    this.router.navigate(['/admin'], { state: this.quiz });
    this.tempDataService.clearTempQuestions();
  }

  saveTempQuestionsToDatabase(quizId: number): void {
    if (this.tempDataService.tempQuestions.length) {
      this.tempDataService.tempQuestions.map(async tq => {
        tq.id = 0;
        await this.insertQuestionToDatabase(tq, quizId);
      });
    }
  }

  async setQuizToDatabase(quiz: Quiz): Promise<any> {
    if (quiz.id === 0) {
      const newQuiz: Quiz = await this.quizService.create(quiz).toPromise();
      this.saveTempQuestionsToDatabase(newQuiz.id);
    }
    else {
      this.saveTempQuestionsToDatabase(quiz.id);
      this.deleteQuestionFromDatabase();
      this.backToTheQuizList();
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

  async insertQuestionToDatabase(question: Question, quizId: number): Promise<any> {
    const newQuestion: Question = await this.questionService.create(question).toPromise();
    this.questions.push(newQuestion);
    this.quiz.questions.push(newQuestion.id);
    this.updateQuiz(this.quiz);
    this.getQuiz();
  }

  async updateQuestionInDatabase(question: Question): Promise<any> {
    if (question.id < 1000000) {
      await this.questionService.update(question).toPromise();
    }
  }

  async deleteQuestionFromDatabase(): Promise<void> {
    if (this.deletingQuestions.length) {

      this.deletingQuestions.forEach(async deletingQuestionId => {
        if (deletingQuestionId < 1000000) {

          await this.questionService.get(deletingQuestionId).toPromise().then(
            async question => {
              if (question.id === deletingQuestionId) {
                await this.questionService.remove(deletingQuestionId).toPromise();
                this.questions = this.questions.filter(question => question.id !== deletingQuestionId);
                this.quiz.questions = this.quiz.questions.filter(questionId => questionId !== deletingQuestionId);
                this.updateQuiz(this.quiz);
              }
            }
          );
        }
      });
    }
  }

  async updateQuiz(quiz: Quiz): Promise<any> {
    await this.quizService.update(quiz).toPromise();
  }

}
