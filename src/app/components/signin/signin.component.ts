import { Component, OnInit } from '@angular/core';
import {Parser} from 'xml2js';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  details:any;
  parsedData:any[]=[];
  fetched=false;
  constructor(){}
  ngOnInit(): void {
      const length=Number(localStorage.getItem('length'));
      const stored=localStorage.getItem('details');
      for(let i=1;i<length;i++)
      {
        const xml=localStorage.getItem(`${i}`);
        if(stored!=null&&xml!=null)        
        {
          this.details=JSON.parse(stored);
          const parser = new Parser();
          parser.parseString(xml, (err, result) => {
          if (!err) {
          const parsedData = result;
          if (parsedData && parsedData.certificate) {
          const certificate = parsedData.certificate;
          const elements = certificate.elements;

          if (elements && elements.length > 0) {
          this.parsedData = [];

          for (let i = 0; i < elements.length; i++) {
          const textData = elements[i].text[0].trim();
          this.parsedData.push(textData);
          }

          console.log(this.parsedData);
          } else {
          console.log("No elements found.");
          }
        } else {
        console.log("Certificate data not found.");
      }
    } else {
      console.log(err);
    }
    });
      
      console.log(this.parsedData);
      this.fetched=true;
      }
    }
  }
}
