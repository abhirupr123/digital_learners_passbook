import express, { urlencoded } from 'express';
import axios from 'axios';
import cors from 'cors';

const app=express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get("/api/authorise",async(req,res)=>{
    const headers={
        'Accept':'*/*',
        'User-Agent':'Thunder Client (https://www.thunderclient.com)'
    }
    const auth=await axios.get("https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize",{
      headers:headers,
      params:{
      client_id: 'YM09DB6624',
      redirect_uri: 'https://google.com',
      response_type: 'code',
      state: 'Testing',
      code_challenge: 'CBUw14zO94M8trTZzPE99ZAvb3N0bRsfy_6vbDcba0c',
      code_challenge_method: 'S256'}     
    });
    res.json(auth.data);
})

app.listen(5000,()=>
    console.log("Server running on port 5000")
);