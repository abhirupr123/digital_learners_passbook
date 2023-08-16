import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  details:any;
  fetched=false;
  constructor(){}
  ngOnInit(): void {
      const stored=localStorage.getItem('details');
      if(stored!=null)        
      {
        this.details=JSON.parse(stored);
        this.fetched=true;
      }
    }
}
