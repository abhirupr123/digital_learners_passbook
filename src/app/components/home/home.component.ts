import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

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
                              localStorage.setItem('length',files.items.length);
                              for(let i=1;i<files.items.length;i++)
                              {
                                console.log(files.items[i].uri);               
                                this.http.post<any>(file,{'token':response.access_token,'file':files.items[i].uri},httpOptions).subscribe(
                                (file:ArrayBuffer)=>{
                                  this.extractTextFromPdf(file).then((pdfText) => {
                                    const xml=this.convertToXML(pdfText);
                                    console.log(xml);
                                    localStorage.removeItem(`${i}`);
                                    localStorage.setItem(`${i}`,xml);
                                  })                               
                                });
                              }
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
    let startCreatingXML=false;
    let xmlData= `<certificate>`;

    for (let paragraph of paragraphs) {
      paragraph = paragraph.trim();
      if (/20\d{2}/.test(paragraph)) {
        startCreatingXML = true;
      }
      if (startCreatingXML && paragraph) {
        const tempElement = document.createElement("text");
        tempElement.textContent = paragraph.replace("'", "&apos;");
        xmlData += `  
          <elements>
            ${tempElement.outerHTML}
          </elements>
        `;
      }
    }

    xmlData += '</certificate>';
    return xmlData;
  }
}