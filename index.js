const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const jwt = require('jsonwebtoken')//Lib responsavel por realizar autenticacao para acesso de rotas em uma API
const dotENV = require('dotenv').config() //Utilizando dotenv para utilizacao de variáveis de ambiente
const dataBase = require('../API REST/dataBase/dataBase')
const auth = require('./middleware/midAuth')//Importando middleware responsável pela autenticacao via JWT

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/games', auth, (req, res) => {
    res.statusCode = 200,
    res.json(dataBase.games)
})

app.get('/game/:id', auth,(req, res) => {    
    if(isNaN(req.params.id)) {
        res.sendStatus(400)
    }else {
        let id = parseInt(req.params.id)

        let HATEOAS = [ //Usado para retornar junto a res links que descrevem quais métodos podem ser
            //utilizados de forma simples naquela rota
            {
                href: "http://localhost:8080/game/"+id,
                method: "DELETE",
                rel: "delete_game"
            },
            {
                href: "http://localhost:8080/game/"+id,
                method: "PUT",
                rel: "edit_game"
            },
            {
                ref: "http://localhost:8080/game/"+id,
                method: "GET",
                rel: "get_this_game"
            },            
            {
                ref: "http://localhost:8080/games",
                method: "GET",
                rel: "get_all_games"
            }            
        ]

        let game = dataBase.games.find(game => game.id == id)

        if(game != undefined) {
            res.statusCode = 200,
            res.json({game, _links: HATEOAS})
        }else {
            res.sendStatus(404)
        }
    }})

app.post('/game', auth,(req, res) => {    
    let title = req.body.title
    let year = req.body.year
    let price = req.body.price

    dataBase.games.push({
        id: 0000,
        title,
        price,
        year
    })
    res.sendStatus(200)    
})

app.delete('/game/:id', auth,(req, res) => {    

    if(isNaN(req.params.id)){
        res.sendStatus(404)
    }else{
        let id = parseInt(req.params.id)
        let index = dataBase.games.findIndex(g => g.id == id)

        if(index == -1){
            res.sendStatus(404)
        }else{
            dataBase.games.splice(index, 1)
            res.sendStatus(200)
        }
    }    
})

app.put('/game/:id', auth,(req, res) => {
    
    if(isNaN(req.params.id)){        
        res.sendStatus(400)
    }else{
        let { title, price, year } = req.body //Utilizando spread 

        let id = parseInt(req.params.id)

        let game = dataBase.games.find(game => game.id == id)

        if(game != undefined) {            
            if(title != undefined){
                game.title = title
            }
            if(price != undefined){
                game.price = price
            }
            if(year != undefined){
                game.year = year
            }
            res.sendStatus(200)

        }else {
            res.sendStatus(404)
        }
    }
})

app.post('/auth', (req, res) => {

    let email = req.body.email
    let password = req.body.password

    if(email != undefined){

        let user = dataBase.users.find(u => u.email == email)
        if(user != undefined){
            if(user.password == password){
                jwt.sign({id: user.id, email: user.email}, process.env.JWT_KEY, {expiresIn:'48h'}, (error, token) => {
                    if(error){
                        res.status(400)
                        res.json({ error: "Falha Interna!" })
                    }else{
                        res.status(200)
                        res.json({ token: token })
                    }
                })                
            }else{
                res.status(401)
                res.json({ error: "Senha informada é Inválida!" })
            }

        }else{
            res.status(404)
            res.json({ error:"E-mail informado nao existe na Base de Dados!" })
        }

    }else{
        res.status(400)
        res.json({ error:"Por favor, insira um e-mail válido no respectivo campo!" })
    }
})

app.listen(8080, () => {
    console.log('Server Running')
})


