import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { LocalStorageService } from '../storage/localStorageService';

@Component({
  selector: 'app-emogi-dialog',
  templateUrl: './emogi-dialog.component.html',
  styleUrls: ['./emogi-dialog.component.scss']
})
export class EmogiDialogComponent implements OnInit {
  emogi = ["😀","😃","😄","😁","😆","🥹","😅","😂","🤣","🥲","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🥸","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","❤️"];

  constructor(private localStorage: LocalStorageService,
              private el: ElementRef,
              private renderer: Renderer2) {}

  ngOnInit() {
    const overlayElement = document.querySelector('.cdk-overlay-dark-backdrop');
    this.renderer.addClass(overlayElement, 'transparentBackground');
  }

  selectEmogi(emogi: any) {
    this.localStorage.setSelectedEmogi(emogi);
  }
}
