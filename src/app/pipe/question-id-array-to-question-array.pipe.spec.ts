import { QuestionIdArrayToQuestionArrayPipe } from './question-id-array-to-question-array.pipe';

describe('QuestionIdArrayToQuestionArrayPipe', () => {
  it('create an instance', () => {
    const pipe = new QuestionIdArrayToQuestionArrayPipe();
    expect(pipe).toBeTruthy();
  });
});
