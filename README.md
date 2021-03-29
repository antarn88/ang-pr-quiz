# Quiz - Angular Gyakorló Feladat

## Kezdő lépések
- Hozz létre egy új repot a Githubon (Readme és init nélkül):
- Név: `ang-pr-quiz`
- Hozz létre a gépeden egy új Angular projektet (Routing és SCSS):
- Név: `ang-pr-quiz`
- Lépj be az új Angular projektbe, majd állítsd rá a VSCode -ot:
- `cd ang-pr-quiz; code . -r`
- Kösd össze a github repoval a Github felületén látható segédlet alapján.

## Feladat
- Készíts egy quiz jellegű appot, amelyben kérdésekre lehet felelni.
- Az app kát fő részből áll: teacher és student nézet.
- A teacher új quiz -eket tud létrehozni és azokat szerkeszteni.
- A student ki tudja tölteni a quiz -t és értékelést kap róla.
- Egyenlőre nem szükséges azonosítás az alkalmazásba.
- A megjelenéshez használj Bootstrap és Font-Awesome keretrendszereket.

## Az alkalmazás részei
### Classes
1. Student: id, name, email, points, active
1. Answer: id, content, correct:Boolean
1. Question: id, question, answers<Answer[]>, points, active
1. Quiz: id, title, description, questions<Question[]>, active

### Services
1. StudentService: a tanulók adatait szolgáltatja, CRUD műveleteket ismeri.
1. QuestionService: Question CRUD.
1. QuizService: Quiz CRUD.
- Általános működésük: készítsd el a json-server számára a szükséges fájlt és 
helyezd el benne a tömböket: students, quizzes, questions (az answer -eknek 
nem kell a szerverről jönnie, elég ha el vannak mentve a Question -ben).
- A json-server szolgáltassa az adatokat és biztosítsa a CRUD műveletekhez a 
backend -et.

### Components
1. AdminComponent: itt táblázatos formában jelennek meg a quiz -ek, minden sor 
végén van törlés és szerkesztés gomb. A táblázat szűrhető és rendezhető. Külön 
gomb van az új quiz létrehozására.
1. QuizEditorComponent: itt az lehet Quiz -t létrehozni vagy szerkeszteni. Erre 
egy űrlap szolgál, validációval.
1. QuestionEditorComponent: ez a QuizEditorComponent -ből nyílik meg, a 
`New Question` gombra kattintva. Egy kérdés csak egy Quiz -hez tartozhat. Ez is 
egy űrlap, ahol validálva lehet bevinni az egyes kérdések adatait.
1. QuizComponent: megjeleníti az egyes Quiz -eket a tanulóknak. Kiírja a kérdést 
és a lehetséges válaszokat, a választás és a továbblépés után pedig jó válasz 
esetén növeli a pontokat, amelyek a nézet jobb felső sarkában láthatóak. Csak 
előre gomb kell, ne lehessen visszalépni. A megjelölt válasz vagy háttérszínnel, 
vagy checkbox -al legyen kiemelve. Elég az egyválasztós lehetőség, nem kell 
több kérdés típus.
1. HomeComponent: itt listázza ki az alkalmazás kártyákon a quiz -eket. Ezek 
közül tud egyet választani a tanuló, és utána azt kitölteni. Kattintásra a 
QuizComponent nyílik meg az adott Quiz -el. A kis kártyákon látszik a Quiz címe 
és rövid leírása is.
1. NavigationComponent: egyszerű Bootstrap navigáció, Home, Admin oldalakkal.
- Általános jellemzők: 
- az űrlapokon minden mező legyen kötelező, a szövegeknek legyen min hossza
- emailhez használhatod az angular email direktívát:  
```html
<input email required name="email" [(ngModel)]="student.email" class="form-control">
```
- a boolean típusú adatokat select vagy checkbox elemmel lehessen módosítani 
- a táblázatokban nem kell a beágyazott objektumokra szűrni/rendezni
- lehetőleg egyedi scss segítségével finomítsd a megjelenést

## Összefoglalás
- A nem szabályozott kérdésekben szabad kezed van.
- Bootstrap keretrendszert használj.
- A validációhoz Template-Driven űrlapokat használj.
- Ha tudsz, akkor készíts BaseService -t, hogy ne kelljen a metódusokat minden 
service -ben megismételned. 
[Példa](https://github.com/cherryApp/str-angular-project-big-private/blob/main/src/app/service/base.service.ts)
  

