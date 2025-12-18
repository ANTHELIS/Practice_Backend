const express = require('express');
const app = express();
const fs = require('fs');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.get("/", (req, res)=>{
    fs.readdir("./files", (err, files)=>{
        res.render('index', {files});
    })
})

app.post("/create", (req, res)=>{
    fs.writeFile(`./files/${req.body.tittle.split(' ').join('')}.txt`, req.body.content, (err)=>{
        res.redirect("/");
    })
})

app.get("/file/:filename", (req, res)=>{
    fs.readFile(`./files/${req.params.filename}`, 'utf8', (err, data)=>{
        res.render('show', {pFilename: req.params.filename, data});
    })
})

app.get("/edit/:filename", (req, res)=>{
    res.render('edit', {filename: req.params.filename});
})
app.post("/edit", (req, res)=>{
    fs.rename(`./files/${req.body.c_tittle}.txt`, `./files/${req.body.n_tittle}.txt`, err=>{
        res.redirect("/");
        console.log(err);
    })
})



app.listen(3000, ()=>{
    console.log("server running at port 3000");
})
