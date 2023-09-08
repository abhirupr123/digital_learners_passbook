# Digital Learners Passbook

The Learners Passbook will act as a digital docket for access by relevant stakeholders wherein it will comprise of digitally verifiable credentials and documents of the learner. The passbook will act as a log of the skills, capabilities, and achievements of the learner. At every touchpoint of the learner journey starting from admission till his employment, there is a need for easily accessible, readable and verifiable credentials.

## Development server

The Tech Stack used for this project is Angular for the frontend and NodeJS for the backend. The backend code is commited at a separate branch and can be accessed [here](https://github.com/abhirupr123/digital-learners-passbook/tree/backend). Along with that styling has been applied using Bootstrap and the different libraries used are mentioned below.

## Functionality

The basic functionality of the Learners Passbook is to leverage DigiLocker APIs to gather the verified user data. This can range from various types of credentials, such as, High School and Intermediate Marksheets, College Degree Certificates as well as DIKSHA course completion certificates as well. Basically all the educational achievements of the learner which is present on DIgiLocker and issued by the user. After extracting this data, it is then displayed in a summarised manner as a document. This document can then be used by other organizations and educational institutes to verify the credibility of the information shared by the user.

## Libraries and Functions implemented

The data extracted from DigiLocker will either be an XML or a PDF document, depending upon the availibility of the particular format in the document issuers repository. Since we are dealing with PDF data as it is more commonly received, there are a few libraries which need to be installed before the program is executed. The libraries are mentioned below - 

```
npm install pdfjs-dist xml2js jspdf
```
Each of these functions play a vital role in the extracting the data from the PDF file, converting the extracted data into corresponding XML document and downloading the resulting summarised data into a PDF file respectively. The code snippets shows how these three libraries have been used - 

```
async extractTextFromPdf(pdfData: ArrayBuffer): Promise<string> {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const textItems = await this.getTextFromPages(pdf);
    return textItems.join('\n');
    }
```
```
download(){
    let pdf=new jsPDF('p','pt','a4');
    pdf.html(this.el.nativeElement,{
      callback:(pdf)=>{
        pdf.save("dlp.pdf");
      }
    })
  } 
```
```
import {Parser} from 'xml2js';

const parser = new Parser();
          parser.parseString(xml, (err, result) => {
          if (!err) {
          const parsedData = result;
          if (parsedData && parsedData.certificate) {
          const certificate = parsedData.certificate;
          const elements = certificate.elements;
          if (elements && elements.length > 0) {
          const parsed = [];
          for (let i = 0; i < elements.length; i++) {
          const textData = elements[i].text[0].trim();
          parsed.push(textData);
          }
          this.parsedData.push(parsed);
          console.log(this.parsedData);
          }
```
## Program Flow 

https://github.com/abhirupr123/digital-learners-passbook/assets/111787164/a5dd7391-b785-4aa8-a7f4-8a51812eddab

The video given above properly demonstrates how exactly the program execution takes place starting from OTP generation to the creation of Passbook and PDF generation. The downloaded PDF contains a QR Code containing the encrypted Digital Certificate, which when decoded by any organization or individual, will display the name of the person or organization generating the Passbook, the name of the organization as well as the timestamp, when the document was being issued. This ensures that the generated Passbook is unique, tamper-proof and can be verified and authenticated which maintains its originality. 
