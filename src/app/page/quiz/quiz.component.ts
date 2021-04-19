import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { Question } from 'src/app/model/question';
import { Quiz } from 'src/app/model/quiz';
import { QuestionService } from 'src/app/service/question.service';
import { QuizService } from 'src/app/service/quiz.service';
import { TempDataService } from 'src/app/service/temp-data.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit, AfterViewChecked {

  quizList$ = this.quizService.list$;
  quizId = 0;
  quiz: Quiz = new Quiz();
  quizQuestionsAsNumbers: number[] = [];
  questionList$: BehaviorSubject<Question[]> = new BehaviorSubject<Question[]>([]);
  currentQuestion$: BehaviorSubject<Question> = new BehaviorSubject<Question>(new Question());
  numberOfQuestion = 1;
  selectedAnswer = 0;
  finishedQuiz = false;
  checkedAnswer = false;
  points = 0;
  correctAnswers = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private quizService: QuizService,
    private questionService: QuestionService,
    public tempDataService: TempDataService
  ) { }

  ngAfterViewChecked(): void {
    this.checkRadioBoxes();
  }

  async ngOnInit(): Promise<void> {
    this.questionList$.next([]);

    this.activatedRoute.params.pipe(
      concatMap(async params => this.quizId = Number(params.id))
    ).toPromise();

    this.quizService.getAll();
    await this.setQuiz();
    this.setQuizQuestionsAsNumbers();
    this.setQuestions().then(questions => this.questionList$.next(questions));
    this.setCurrentQuestion(this.numberOfQuestion);
  }

  async setQuiz(): Promise<any> {
    this.quiz = await this.quizService.get(this.quizId).toPromise();
    this.quizQuestionsAsNumbers = this.quiz.questions;
  }

  setQuizQuestionsAsNumbers(): void {
    this.quizQuestionsAsNumbers = this.quiz.questions;
    this.filterInactiveQuestions();
  }

  async setQuestions(): Promise<Question[]> {
    const questionService = this.questionService;
    const questions: Question[] = [];
    this.quizQuestionsAsNumbers.forEach(questionId => {
      async function getQuestion$(): Promise<any> {
        const question = await questionService.get(questionId).toPromise();
        questions.push(question);
      }
      getQuestion$();
    });
    return questions;
  }

  async setCurrentQuestion(questionNumberInQuiz: number): Promise<void> {
    const questionId = this.quizQuestionsAsNumbers[questionNumberInQuiz - 1];
    if (questionId) {
      const question = await this.questionService.get(questionId).toPromise().catch(() => { });
      this.currentQuestion$.next(question || new Question());
      this.checkRadioBoxes();
    }
  }

  async filterInactiveQuestions(): Promise<void> {
    const isActiveQuestion = async (questionId: number): Promise<boolean> => {
      const question = await this.questionService.get(questionId).toPromise();
      return question.active ? true : false;
    };
    for (const questionId of this.quizQuestionsAsNumbers) {
      const questionIndexInArray = this.quizQuestionsAsNumbers.findIndex(qId => questionId === qId);
      if (!await isActiveQuestion(questionId)) {
        this.quizQuestionsAsNumbers.splice(questionIndexInArray, 1);
      }
    }
  }

  async isCorrectAnswer(selectedAnswer: number): Promise<boolean> {
    const currentQuestion = this.currentQuestion$.getValue();
    const correctAnswer = currentQuestion.answers.filter(answer => answer.correct)[0];
    if (correctAnswer.id === selectedAnswer) {
      return true;
    }
    else {
      return false;
    }
  }

  async jumpToTheNextQuestion(): Promise<void> {
    this.numberOfQuestion++;
    const question = this.currentQuestion$.getValue();
    const nextButton = document.querySelector('.next-button') as HTMLElement;
    if (nextButton.textContent === 'Finish quiz') {
      this.finishQuiz();
    }

    if (this.numberOfQuestion === this.quizQuestionsAsNumbers.length) {
      nextButton.textContent = 'Finish quiz';
    }

    this.setCurrentQuestion(this.numberOfQuestion);

    if (await this.isCorrectAnswer(this.selectedAnswer)) {
      this.points += question.points;
      this.correctAnswers++;
    }

    this.selectedAnswer = 0;
    this.checkedAnswer = false;
  }

  checkRadioBoxes(): void {
    const radioButtons = document.querySelectorAll('input[type=radio]');
    radioButtons.forEach(rb => {
      const radioButton = (rb as HTMLElement);
      radioButton.addEventListener('click', () => {
        this.checkedAnswer = true;
      });
    });
  }

  finishQuiz(): void {
    (document.querySelector('form') as HTMLElement).style.display = 'none';
    this.finishedQuiz = true;
  }

  getPercentFromResults(): number {
    return Math.floor(this.correctAnswers * 100 / this.quizQuestionsAsNumbers.length);
  }

}
