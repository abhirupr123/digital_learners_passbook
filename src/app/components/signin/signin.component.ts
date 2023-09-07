import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {Parser} from 'xml2js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import forge from 'node-forge';
import QRCode from 'qrcode-generator';

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
  showbutton=true;
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
    this.showbutton=false;
  
  setTimeout(()=>{
  const pdf = new jsPDF('p', 'pt', 'a3');

  const htmlContent = this.el.nativeElement; 
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const addHTMLToPDF = async () => {
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfMargin = 20; 
    const pdfContentHeight = pdfHeight - 2 * pdfMargin;

    const canvas = document.createElement('canvas');
    canvas.width = pdfWidth;
    canvas.height = pdfContentHeight;

    const ctx = canvas.getContext('2d');
    const htmlToCanvasOptions = {
      scale: 0.55, 
      canvas: canvas,
      logging: true,
      width: pdfWidth,
      height: pdfContentHeight
    };

    return html2canvas(htmlContent, htmlToCanvasOptions).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', pdfMargin, pdfMargin, pdfWidth, pdfContentHeight);
    
      const verifiedStampImg = new Image();
      verifiedStampImg.src = 'https://bfsi.eletsonline.com/wp-content/uploads/2016/10/digital-india.jpg'; // Replace with the actual path to your "Verified" stamp image
      pdf.addImage(verifiedStampImg, 'PNG', 650, 10, 140, 70); 
    
    });
  };

  addHTMLToPDF().then(async() => {
    try{
    const cert=this.createDigitalSignature(pdf, 'E:\dlp\private_key.pem', 'E:\dlp\mycert.pem')
    const qr=this.embedCertificateData(await cert); 
    pdf.addImage(qr, 'PNG', 670, 90, 90, 90);
        pdf.save('dlp.pdf');
    }
      catch(error) {
        console.error('Error creating digital signature:', error);
      }
      finally{
        this.showbutton=true;
      };
  });
  },500);
}

  async createDigitalSignature(pdf: jsPDF, privateKeyPath: string, certificatePath: string) {
    return new Promise<string>((resolve, reject) => {
    
    const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });

    const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);
  
    const pdfContentHash = forge.md.sha256.create();
    pdfContentHash.update(pdf.output());
  
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const signature = privateKey.sign(pdfContentHash);
  
    const encode=forge.util.encode64(signature);
    resolve(encode);
  });
}

embedCertificateData(certificateData:string) {
  const qr = QRCode(0, 'L');
  qr.addData(certificateData);
  qr.make();
  const qrImage = qr.createDataURL();
  return qrImage;
}

} 
