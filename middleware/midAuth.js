const jwt = require('jsonwebtoken')
const dotENV = require('dotenv').config()

function midAuth(req, res, next){
    const authToken = req.headers['authorization'] //O token será recebido no Header da requisicao denominado Authorization

    if(authToken != undefined){
        const bearer = authToken.split(' ') //O token retorna 2 strings, onde por isso devemos separar as 2 urtilizando apenas o token propriamente dito 
        let token = bearer[1]//Acessando o segundo elemento do arrey criado com split

        jwt.verify(token, process.env.JWT_KEY, (error, dataUser) => { //Comparando o token oriundo do header com o token armazenado na variável de ambiente
            if(error){
                res.status(401)
                res.json({error: "Token Inválido!"})
            }else{
                req.token = token
                req.loggedUser = { id: dataUser.id, email: dataUser.email }
                next()
            }
        })
    }else{
        res.status(401)
        res.json({error: "Token Inválido!"})
    }    
}

module.exports = midAuth

