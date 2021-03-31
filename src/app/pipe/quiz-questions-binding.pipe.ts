import { Pipe, PipeTransform } from '@angular/core';
import { Quiz } from '../model/quiz';
import { QuestionService } from '../service/question.service';

@Pipe({
  name: 'quizQuestionsBinding'
})
export class QuizQuestionsBindingPipe implements PipeTransform {

  constructor(private questionService: QuestionService) { }

  transform(quizzes: Quiz[] | null): Quiz[] | null {
    if (quizzes) {
      quizzes.map(quiz => {
        quiz.questions.map((question, index) => this.questionService.get(question).subscribe(questionObj => {
          quiz.questions[index] = questionObj.question;
        }));
      });
    }
    return quizzes;
  }

}
