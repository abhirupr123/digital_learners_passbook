import express, { response, text, urlencoded } from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

const app=express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
dotenv.config();

app.get("/api/authorise",async(req,res)=>{
      
      const auth=await axios.get("https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize",{
      params:{
      redirect_uri: 'http://localhost:4200/DLP',
      client_id: process.env.CLIENT_ID,
      response_type: 'code',
      state: 'Testing',
      code_challenge: process.env.CODE_CHALLENGE,
      code_challenge_method: 'S256'
      }     
    });
    const url=auth.request.res.responseUrl;
    res.json({url:url});
});

app.post("/api/token",async(req,res)=>{
    
const tokenEndpoint = 'https://digilocker.meripehchaan.gov.in/public/oauth2/2/token';
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const authorizationCode = req.body.code;
const redirectUri = 'http://localhost:4200/DLP';
const codeVerifier= process.env.CODE_VERIFIER;

const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

const data = new URLSearchParams();
data.append('grant_type', 'authorization_code');
data.append('code', authorizationCode);
data.append('redirect_uri', redirectUri);
data.append('code_verifier', codeVerifier);


axios.post(tokenEndpoint, data, {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `Basic ${credentials}`,
  },
})
  .then((response) => {
    
    console.log('Access Token:', response.data.access_token);
    console.log('Token Type:', response.data.token_type);
    console.log('Expires In:', response.data.expires_in);
    res.json(response.data);
    
  })
  .catch((error) => {
    console.error('Error:', error.response.data);
  });
})

app.post('/api/details',async(req,res)=>{
    const details=await axios.get('https://digilocker.meripehchaan.gov.in/public/oauth2/1/user',{
        headers:{
            Authorization: `Bearer ${req.body.token}`
        }
    });
    res.json(details.data);
})

app.post('/api/files',async(req,res)=>{
    const files=await axios.get('https://digilocker.meripehchaan.gov.in/public/oauth2/2/files/issued',{
        headers:{
            Authorization: `Bearer ${req.body.token}`
        }
    });
    res.json(files.data);
})

app.post('/api/file',async(req,res)=>{
    const file=await axios.get(`https://digilocker.meripehchaan.gov.in/public/oauth2/1/file/${process.env.FILE_URI}`,{
    headers:{
        Authorization: `Bearer ${req.body.token}`
    },
    params:{
        uri:process.env.FILE_URI
    }});
    res.json(file.data);
})

app.listen(5000,()=>
    console.log("Server running on port 5000")
);