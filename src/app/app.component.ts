import { Component } from '@angular/core';
import { faCrown, faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dqxbelt';
  faTrashAlt = faTrashAlt;
  faPencilAlt = faPencilAlt;
  faCrown = faCrown;
}
