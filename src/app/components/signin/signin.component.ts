import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {Parser} from 'xml2js';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  @ViewChild('pdf',{static:false}) el!:ElementRef;
  desc:any;
  issuer:any;
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
        this.desc=localStorage.getItem(`description${i}`);
        this.issuer=localStorage.getItem(`issuer${i}`);
        console.log(this.desc);
        console.log(this.issuer);
        console.log(xml);
        if(stored!=null&&xml!=null)        
        {
          this.details=JSON.parse(stored);
          this.details.dob=this.details.dob.substring(0, 2) + '-' + this.details.dob.substring(2, 4) + '-' + this.details.dob.substring(4);
          const parser = new Parser();
          parser.parseString(xml, (err, result) => {
          if (!err) {
          const parsedData = result;
          if (parsedData && parsedData.certificate) {
          const certificate = parsedData.certificate;
          const elements = certificate.elements;

          if (elements && elements.length > 0) {
          const parsed = [];
          parsed.push(this.desc);
          parsed.push(this.issuer);
          for (let i = 0; i < elements.length; i++) {
          const textData = elements[i].text[0].trim();
          parsed.push(textData);
          }
          this.parsedData.push(parsed);
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
  doesMatchPattern(inputString: string, pattern: string): boolean {
    const regex = new RegExp(pattern);
    return regex.test(inputString);
  }
  containsSchoolOrCollege(name: string): boolean {
    return name.toLowerCase().includes('school') || name.toLowerCase().includes('college');
  }
  decode(name: string):string{
    const enc=name.replace(/&apos;/g,"'").replace(/&amp;/g,"&");
    return enc;
  }
  index(num:string):boolean{
    return num.includes('/');
  }
  roll(num:string):boolean{
    return /^\d{6,7}$/.test(num);
  }
  resultDate(date:string):boolean{
    const res=date.match(/[0-9]/g);
    res?res.join(''):null;
    if(!res && typeof res!=='string')
    return false;
    const parts = date.split('.').reverse();
    parts.join('-');
    return parts.length===3;
  }
  pass(res:string):boolean{
    return res.includes('PASS');
  }
  download(){
    let pdf=new jsPDF('p','pt','a4');
    pdf.html(this.el.nativeElement,{
      callback:(pdf)=>{
        pdf.save("dlp.pdf");
      }
    })
  } 
}
