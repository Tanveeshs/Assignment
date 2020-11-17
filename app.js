const express = require('express')
const app = express()
const axios = require('axios')

app.get('/getConferences', function (req,res,next){
    axios.get('https://o136z8hk40.execute-api.us-east-1.amazonaws.com/dev/get-list-of-conferences')
        .then(response=>{
            let data = response.data;
            let conferences = [...data.paid,...data.free]
            let output = []
            conferences.forEach(conf=>{
                let str = `${conf.confName},${conf.confStartDate},${conf.city},${conf.state},${conf.country},${conf.entryType}`;
                output.push(str)
            })
            res.send(output);
            return next();
        })
        .catch(err=>{
            console.log(err)
            res.json({success:0,message:"Sorry there is some error"})
            return next();
        })
})
app.get('/exact_duplicates',function (req,res){
    axios.get('https://o136z8hk40.execute-api.us-east-1.amazonaws.com/dev/get-list-of-conferences')
        .then(response=>{
            let data = response.data;
            let conferences = [...data.paid,...data.free]
            let output = [];
            for (let i = 0; i < conferences.length; i++) {
                for (let j = i+1; j < conferences.length; j++) {
                    if(compareObjExactEqual(conferences[i],conferences[j])){
                        output.push(conferences[i]);
                    }
                }
            }
            res.send(output)
        })
        .catch(err=>{
            console.log(err)
            res.json({success:0,message:"Sorry there is some error"})
            return next();
        })
})
app.get('/similar_duplicates',function (req,res){
    axios.get('https://o136z8hk40.execute-api.us-east-1.amazonaws.com/dev/get-list-of-conferences')
        .then(response=>{
            let data = response.data;
            let conferences = [...data.paid,...data.free]
            let output = [];
            for (let i = 0; i < conferences.length; i++) {
                for (let j = i+1; j < conferences.length; j++) {
                    if(compareObjForSemantic(conferences[i],conferences[j])){
                        output.push(conferences[i]);
                    }
                }
            }
            res.send(output)
        })
})


function compareObjForSemantic(a,b){
    //Match URL
    if(a.confUrl!==b.confUrl){
        return false
    }else {
        //ALlow changes in name
        if(compareIncorrectCharNameStr(a.confName,b.confName)){
            return true
        }else {
            return false;
        }
    }
}
function compareIncorrectCharNameStr(s1,s2){
    if(typeof s1!=="string" || typeof s2!=="string"){
        return false;
    }
    let len = s2.length;
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    if(s1.length>s2.length){
        len = s1.length
    }
    let incorrectChar=0;
    let invalidChars=6;
    for (let i = 0; i <len; i++) {
        if(s1.charAt(i)!==s2.charAt(i)){
            incorrectChar++;
        }
        if(incorrectChar>invalidChars){
            return false;
        }
    }
    return true;
}


function compareObjExactEqual(a,b){
    let keys = Object.keys(a);
    let count =0;
    keys.forEach(key=>{
        if(a[key]===b[key]){
            count++;
        }
    })
    if(count===keys.length){
        return true;
    }else {
        return false;
    }
}
app.listen(3000,function (err){
    if(err){
        console.log("ERROR")
    }else {
        console.log("SERVER RUNNING ON 3000")
    }
})
