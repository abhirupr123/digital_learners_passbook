# Digital Learners Passbook

This branch specifies the backend implementation of the Learners Passbook and the DigiLocker APIs used. The backend is developed using NodeJS and the API calls are made through a server. Before starting the server, make sure to configure all the environment variables used for the API credentials.

## Getting Started

```
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
```
The above code sends an API call for the user Sign In through OTP. As the ```redirect_uri``` is explicitly mentioned to be localhost, therefore it is necessary to run the program on the local environment. 

Suppose in future, some organization or educational institute makes use of this solution, then to verify the user credentials, they need to use their own credentials in place of using the above credentials, it needs to be changed to the organization specific credentials, so that after this API call, the user can give his/her consent. Before running the server, make sure to create a ```client_id``` on DigiLocker to access the APIs.

![Screenshot (104)](https://github.com/abhirupr123/digital-learners-passbook/assets/111787164/08bc3ec0-42f3-4b10-a841-097738dd1432)

In the above image, after the organization creates its own credentials, it will be able to verify the user credentials through DigiLocker, provided the user clicks on the allow button. The only difference will be, in place of C4GT's name, the name of the specific organization will appear.

```
app.post('/api/file',async(req,res)=>{
    const file=await axios.get(`https://digilocker.meripehchaan.gov.in/public/oauth2/1/file/${req.body.file}`,{
    responseType:'arraybuffer',
    headers:{
        Authorization: `Bearer ${req.body.token}`
    },
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.send(file.data);
})
```
The above code, fetches the data of all the files issued by the user in Digilocker in PDF format. This data is ultimately sent as response to be displayed on the browser. The ```req.body.file``` here specifies the file uri which is being fetched from DigiLocker, i.e., this API fetches the data of each document one by one.
