import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import xmljs from 'xml-js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
    constructor(private http:HttpClient){}
    authorise(){
      const api='http://localhost:5000/api/authorise'
      this.http.get<any>(api).subscribe(
        (response)=>{
          console.log(response);
          const tab=window.open(response.url);
          const int=setInterval(()=>{
            if(tab?.closed)
            clearInterval(int)
            else
            {
              const url=tab?.location.href;
              const param=new URLSearchParams(url?.split('?')[1]);
              const code=param.get('code');
              if(code)
              {
                console.log(code);
                clearInterval(int);
                const token='http://localhost:5000/api/token';
                this.http.post<any>(token,{'code':code}).subscribe(
                    (response)=>{
                      console.log(response);
                      const details='http://localhost:5000/api/details';
                      this.http.post<any>(details,{'token':response.access_token}).subscribe(
                        (det)=>{
                          console.log(det);
                          localStorage.removeItem('details');
                          localStorage.setItem('details',JSON.stringify(det));
                          const files='http://localhost:5000/api/files';
                          this.http.post<any>(files,{'token':response.access_token}).subscribe(
                            (files)=>{
                              console.log(files);
                              const file='http://localhost:5000/api/file';
                              const httpOptions={
                                headers:new HttpHeaders({
                                  'Content-Type': 'application/json'
                                }),
                                responseType:'arraybuffer' as 'json',
                              };
                              this.http.post<any>(file,{'token':response.access_token},httpOptions).subscribe(
                                (file:ArrayBuffer)=>{
                                  this.extractTextFromPdf(file).then((pdfText) => {
                                    console.log(pdfText);
                                    // Continue with the extracted PDF text
                                    console.log(this.convertToXML(pdfText));
                                  })                               
                                });
                            }
                          )
                        }
                      )
                    },
                    (error)=>{
                      console.log("API Error: ",error);
                    }
                )
              }
            }
          },1000);
        },
        (error)=>{
          console.error("API error:",error);
         }
      )
    }
    async extractTextFromPdf(pdfData: ArrayBuffer): Promise<string> {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const textItems = await this.getTextFromPages(pdf);
    return textItems.join('\n');
    }
    
    async getTextFromPages(pdf: pdfjsLib.PDFDocumentProxy): Promise<string[]> {
      const textItems: string[] = [];
      for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex++) {
        const page = await pdf.getPage(pageIndex);
        const textContent = await page.getTextContent();
        
        textContent.items.forEach((item) => {
          if (item instanceof Object && 'str' in item) {
            textItems.push(item.str);
          }
        });
      }
      return textItems;
    }
  convertToXML(pdfText: string): string {
    const paragraphs = pdfText.split('\n');
  
    const xmlData = {
      elements: [
        {
          type: 'element',
          name: 'document',
          elements: paragraphs.map(paragraph => ({
            type: 'element',
            name: 'paragraph',
            elements: [
              {
                type: 'text',
                text: paragraph
              }
            ]
          }))
        }
      ]
    };
  
    const xmlOptions = {
      spaces: 2,
      compact: true
    };
  
    const xmlDocument = xmljs.js2xml(xmlData, xmlOptions);
  
    return xmlDocument;
  }
}