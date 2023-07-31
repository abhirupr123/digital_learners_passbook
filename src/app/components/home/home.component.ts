import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
    constructor(private http:HttpClient, private route:ActivatedRoute){}
    /*ngOnInit(): void {
        this.authorise();
    }*/
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
                                  console.log(file);
                                })
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
}