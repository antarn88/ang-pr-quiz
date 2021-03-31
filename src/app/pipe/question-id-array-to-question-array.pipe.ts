import { Pipe, PipeTransform } from '@angular/core';
import { Question } from '../model/question';
import { QuestionService } from '../service/question.service';

@Pipe({
  name: 'questionIdArrayToQuestionArray'
})
export class QuestionIdArrayToQuestionArrayPipe implements PipeTransform {

  constructor(private questionService: QuestionService) { }

  transform(questionIdArray: number[]): Question[] {
    const questionArray: Question[] = [];

    questionIdArray.forEach(questionId => {
      this.questionService.get(questionId).subscribe(question => {
        questionArray.push(question);
      });
    });

    return questionArray;
  }

}
