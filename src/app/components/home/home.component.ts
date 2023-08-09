import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
//import { PdfService } from 'src/app/pdf.service';
//import * as pdfjsLib from 'pdfjs-dist';
import * as PDFParser from 'pdf-parse';
import {NgxExtendedPdfViewerModule} from 'ngx-extended-pdf-viewer';

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
                          const files='http://localhost:5000/api/files';
                          this.http.post<any>(files,{'token':response.access_token}).subscribe(
                            (files)=>{
                              console.log(files);
                              const file='http://localhost:5000/api/file';
                              this.http.post<any>(file,{'token':response.access_token}).subscribe(
                                (file)=>{
                                  /*const blob=new Blob([file],{type:'application/pdf'});
                                  this.pdf.parsePdfToJSON(blob).subscribe((parse)=>{
                                    const json=JSON.stringify(parse);*/
                                    //console.log(file);
                                    //this.readPdfContents(file);
                                    this.extractPdfText(file);
                                  });
                                //})
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
    /*readPdfContents(pdfData: any): void {
      pdfjsLib.getDocument({ data: pdfData }).promise.then((pdf) => {
        const numPages = pdf.numPages;
        let xmlDocument = '<?xml version="1.0" encoding="UTF-8"?><pdfContents>';
    
        for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
          pdf.getPage(pageNumber).then((page) => {
            page.getTextContent().then((textContent) => {
              const pageText = textContent.items
            .map(item => {
              if ('str' in item) {
                return item.str;
              } else if ('items' in item && Array.isArray(item.items)) {
                return item.items
                  .filter(subItem => 'str' in subItem)
                  .map(subItem => subItem.str)
                  .join('');
              } else {
                return '';
              }
            })
            .join(' ');
    
              // Escape special XML characters
              const escapedPageText = pageText.replace(/&/g, '&amp;')
                                             .replace(/</g, '&lt;')
                                             .replace(/>/g, '&gt;')
                                             .replace(/"/g, '&quot;')
                                             .replace(/'/g, '&apos;');
    
              xmlDocument += `<page number="${pageNumber}"><content>${escapedPageText}</content></page>`;
              
              if (pageNumber === numPages) {
                xmlDocument += '</pdfContents>';
    
                // Now you have the complete XML document
                console.log('XML Content:', xmlDocument);
              }
            });
          });
        }
      });
    }*/
    /*readPdfContents(pdfData: any): void {
      pdfjsLib.getDocument({ data: pdfData }).promise.then((pdf) => {
        const numPages = pdf.numPages;
    
        for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
          pdf.getPage(pageNumber).then((page) => {
            page.getTextContent().then((textContent) => {
              const pageText = textContent.items
            .map(item => {
              if ('str' in item) {
                return item.str;
              } else if ('items' in item && Array.isArray(item.items)) {
                return item.items
                  .filter(subItem => 'str' in subItem)
                  .map(subItem => subItem.str)
                  .join('');
              } else {
                return '';
              }
            })
            .join(' ');
            console.log('Page ' + pageNumber + ' text:', pageText);
            });
          });
        }
      });
    }*/
    
    extractPdfText(pdfData: any): void {
      const pdfBuffer = new Uint8Array(pdfData);
      const pdfBufferAsBuffer = Buffer.from(pdfBuffer);

      PDFParser(pdfBufferAsBuffer).then((data: any) => {
        const pdfText = data.text;
        console.log('PDF Text:', pdfText);
  
        // You can now process the extracted text as needed
      }).catch((error:Error) => {
        console.error('Error parsing PDF:', error);
      });
    }
}