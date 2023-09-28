import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-viewing-images',
  templateUrl: './viewing-images.component.html',
  styleUrls: ['./viewing-images.component.scss']
})
export class ViewingImagesComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: String) {}

}
