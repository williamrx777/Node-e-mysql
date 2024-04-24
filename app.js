const { engine } = require('express-handlebars')
const express = require('express');
const mysql = require('mysql2')
const app = express();
const fs = require('fs')
const fileupload = require('express-fileupload')
// app.use('/bootstrap', express.static('./node_module/bootstrap/dist/'))

app.use('/css',express.static('./css'))
app.use('/imagem', express.static('./imagem'))
const conexao = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'22303634',
    database:'Projeto'
})

app.engine('handlebars', engine({
    helpers: {
        condicionalIgualdade: function (parametro1, parametro2,options){
            return parametro1 === parametro2 ? options.fn(this): options.inverse(this)
        }
    }
}))
app.set('view engine', 'handlebars')
app.set('views', './views')
app.use(fileupload())
app.use(express.json())
app.use(express.urlencoded({extended:false}))

conexao.connect(function(erro){
    if(erro) throw erro
    console.log('Conexão realizada com sucesso')
})

app.get('/', function(req, res){
    let sql = 'SELECT * FROM Produtos'
    conexao.query(sql, function(erro, retorno){
        res.render('formulario', {produtos:retorno})
    })
})

app.get('/:situacao', function(req, res){
    let sql = 'SELECT * FROM Produtos'
    conexao.query(sql, function(erro, retorno){
        res.render('formulario', {produtos:retorno, situacao:req.params.situacao})
    })
})

app.post('/cadastrar', function(req,res){
    try{
    let nome = req.body.nome
    let valor = req.body.valor
    let imagem = req.files.imagem.name

    if(nome == '' || valor == '' || isNaN(valor)){
        res.redirect('/falhaCadastro')
    }else{

        // req.files.imagem.mv(__dirname+'/imagem/'+req.files.imagem.name)
        let sql = `INSERT INTO Produtos (nome, valor, imagem) VALUES ('${nome}', ${valor}, '${imagem}')`
        conexao.query(sql, function(erro, retorno){
            if(erro) throw erro
            
            req.files.imagem.mv(__dirname+'/imagem/'+req.files.imagem.name)
            console.log(retorno)
    
        })
        res.redirect('/okCadastro')
    }

    }catch(erro){
        res.redirect('/falhaCadastro')
    }
})

app.get('/remover/:codigo&:imagem', function(req,res){
    try{

        // console.log(req.params.codigo)
        // console.log(req.params.imagem)
        // res.end()
        let sql = `DELETE FROM Produtos WHERE codigo = ${req.params.codigo}`
    
        conexao.query(sql, function(erro, retorno){
            if(erro) throw erro
    
            fs.unlink(__dirname+'/imagem/'+req.params.imagem, (erro_imagem)=> {
                console.log('removido com sucesso')
            })
        })
        res.redirect('/okRemover')
    }catch(erro){
        res.redirect('/falhaRemover')
    }
})

app.get('/formularioEditar/:codigo', function(req, res){
    // res.render('formularioEditar')
    let sql = `SELECT * FROM Produtos WHERE codigo = ${req.params.codigo}`

    conexao.query(sql, function(erro, retorno){
        if(erro) throw erro

        res.render('formularioEditar', {produto:retorno[0]})
    })
})

app.post('/editar', function(req, res){
    let nome = req.body.nome
    let valor = req.body.valor
    let codigo = req.body.codigo
    let nomeImagem = req.body.nomeImagem
    
    if(nome == '' || valor == '' || isNaN(valor)){
        res.redirect('falhaEdicao')
    }else{
        
        
            try{
                let imagem = req.files.imagem
                let sql = `UPDATE Produtos SET nome='${nome}',valor='${valor}', imagem='${imagem.name}' WHERE codigo='${codigo}'`
                conexao.query(sql, function(erro, retorno){
                    if(erro) throw erro
        
                    fs.unlink(__dirname+'/imagem/'+nomeImagem, (erro_imagem)=>{
                        console.log('Falha ao remover a imagem')
                    })
                    imagem.mv(__dirname+'/imagem/'+imagem.name)
                })
            }catch{
                let sql = `UPDATE Produtos SET nome='${nome}',valor='${valor}' WHERE codigo='${codigo}'`
                conexao.query(sql,function(erro,retorno){
                    if(erro) throw erro
                })
            }
            
        
            res.redirect('/okEdicao')
    }

})

app.listen(80);