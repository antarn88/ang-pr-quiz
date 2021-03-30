import { Pipe, PipeTransform } from '@angular/core';
import { Quiz } from '../model/quiz';
import { QuestionService } from '../service/question.service';

@Pipe({
  name: 'quizQuestionsBinding'
})
export class QuizQuestionsBindingPipe implements PipeTransform {

  constructor(private questionService: QuestionService) { }

  transform(quizzes: Quiz[] | null): Quiz[] | null {
    const questionsAsString: string[] = [];
    if (quizzes) {
      quizzes.map(quiz => {
        quiz.questions.map(question => this.questionService.get(question).subscribe(
          questionObj => questionsAsString.push(questionObj.question)));
        quiz.questions = questionsAsString;
      });
    }
    return quizzes;
  }

}
