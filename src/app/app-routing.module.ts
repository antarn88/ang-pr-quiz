import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './page/admin/admin.component';
import { HomeComponent } from './page/home/home.component';
import { QuestionEditorComponent } from './page/question-editor/question-editor.component';
import { QuizEditorComponent } from './page/quiz-editor/quiz-editor.component';
import { QuizComponent } from './page/quiz/quiz.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'quiz/:id',
    component: QuizComponent
  },
  {
    path: 'admin',
    component: AdminComponent
  },
  {
    path: 'admin/quiz/:id',
    component: QuizEditorComponent
  },
  {
    path: 'admin/quiz/:id/question/:id',
    component: QuestionEditorComponent
  },
  {
    path: '**',
    component: HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
