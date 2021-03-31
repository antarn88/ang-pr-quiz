import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Quiz } from 'src/app/model/quiz';
import { QuestionService } from 'src/app/service/question.service';
import { QuizService } from 'src/app/service/quiz.service';

@Component({
  selector: 'app-quiz-editor',
  templateUrl: './quiz-editor.component.html',
  styleUrls: ['./quiz-editor.component.scss']
})
export class QuizEditorComponent implements OnInit {

  quizId: number = 0;
  quiz: Quiz = new Quiz();
  deletingQuestions: number[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private quizService: QuizService,
    private questionService: QuestionService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => this.quizId = Number(params.id));
    this.getQuiz();
  }

  getQuiz(): void {
    if (this.quizId === 0) {
    }
    else {
      this.quizService.get(this.quizId).subscribe(quiz => this.quiz = quiz);
    }
  }

  deleteQuestion(questionId: number): void {
    const questionIndex = this.quiz.questions.findIndex(question => question === questionId);
    this.quiz.questions.splice(questionIndex, 1);
    const questionHTMLElement = document.querySelector(`#question-${questionId}`)?.parentElement;
    if (questionHTMLElement) questionHTMLElement.outerHTML = '';
    this.deletingQuestions.push(questionId);
  }

  backToTheQuizList(): void {
    this.deletingQuestions = [];
    this.router.navigate(['/admin']);
  }

  setQuizToDatabase(quiz: Quiz): void {
    this.quizService.update(quiz).subscribe(
      () => {
        if (this.deletingQuestions.length) {
          this.deletingQuestions.forEach(deletingQuestionId => {
            this.questionService.remove(deletingQuestionId).subscribe();
          });
        }
        this.backToTheQuizList();
      }
    );
  }

}
