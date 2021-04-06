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

  addQuestionToQuizObject(questionId: number): void {
    this.quiz.questions.push(questionId);
  }

  async saveTempQuestionsToDatabase(): Promise<any> {
    this.tempDataService.tempQuestions.map(async tq => {
      tq.id = 0;
      await this.questionService.create(tq).toPromise().then(
        newQuestion => {
          this.quiz.questions.push(newQuestion.id);
        }
      );
    });
  }

  async updateQuiz(quiz: Quiz): Promise<any> {
    await this.quizService.update(quiz).toPromise();
  }

  async setQuizToDatabase(quiz: Quiz): Promise<any> {
    if (quiz.id === 0) {
      await this.quizService.create(quiz).toPromise();
      this.saveTempQuestionsToDatabase();
    }
    else {
      if (this.tempDataService.tempQuestions.length) {
        const createAndStoreQuestions = this.tempDataService.tempQuestions.map(async tq => {
          tq.id = 0;
          await this.questionService.create(tq).toPromise()
            .then(newQuestion => this.quiz.questions.push(newQuestion.id));
        });

        Promise.all(createAndStoreQuestions)
          .then(
            () => this.updateQuiz(this.quiz))
          .then(
            () => {
              this.tempDataService.clearTempQuestions();
              this.deleteQuestionFromDatabase();
            })
          .then(
            () => { }
          );
      } else {
        this.deleteQuestionFromDatabase()
          .then(
            () => { }
          );
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

  async deleteQuestionFromDatabase(): Promise<any> {
    if (this.deletingQuestions.length) {
      this.deletingQuestions.map(async deletingQuestionId => {
        if (deletingQuestionId < 1000000) {
          const getQuestion = this.questionService.get(deletingQuestionId).toPromise();
          getQuestion
            .then(question => {
              if (question.id === deletingQuestionId) {
                const removeQuestion = this.questionService.remove(deletingQuestionId).toPromise();
                removeQuestion
                  .then(
                    () => {
                      this.questions = this.questions.filter(question => question.id !== deletingQuestionId);
                      this.quiz.questions = this.quiz.questions.filter(questionId => questionId !== deletingQuestionId);
                    })
                  .then(
                    () => this.updateQuiz(this.quiz))
                  .then(
                    () => this.backToTheQuizList()
                  );
              }
            }
            );
        }
      });
    }
    else {
      this.backToTheQuizList();
    }
  }

}
