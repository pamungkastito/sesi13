const { json } = require('express')
const express = require('express')
const app = express()
const pool = require('./config/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const port = 5000

app.use(express.json())

app.post('/signup', async(req, res) => {
    try{
        const {firstName, lastName, email, password} = req.body

        if(!(lastName && firstName && email && password)) {
            res.status(400).json({
                status: false,
                message: 'All input is required'
            })
        }

        var encryptedPassword = await bcrypt.hash(password, 10)

        pool.query(`SELECT * FROM user WHERE email = '${email}'`, (error, result) => {
            if(error) {
                res.status(400).json({
                    status: false,
                    message: 'User already registered'
                })
            }

            var isExist = result.rowCount
            console.log(isExist, '<<<<')
            
            if(isExist == 1) {
                res.status(400).json({
                    status: false,
                    message: 'User already registered'
                })
            } else {

                pool.query('INSERT INTO user (firstName, lastName, email, password) VALUES ($1, $2, $3, $4)', [firstName, lastName, email, encryptedPassword], (error) => {
                if(error){
                    res.status(400).json({
                        status: false,
                        message: 'Failed register user'
                    })
                }
                })

                res.status(200).json({
                    status: true,
                    message: 'Success'
                })
            }
        })

    }catch (err) {
        res.status(400).json({
            status: false,
            message: err
        })
    }
})

app.post('/signin', async(req,res) => {
    try{
        const {email, password} = req.body

        if(!(email && password)) {
            res.status(400).json({
                status: false,
                message: 'All input is required'
            })
        }

        pool.query(`SELECT * FROM user WHERE email = '${email}'`, (error, result) => {
            if(error) {
                res.status(400).json({
                    status: false,
                    message: 'User not found'
                })
            }

            var passUser = result.rows[0].password

            if ((bcrypt.compare(password, passUser))){
                const token = jwt.sign(
                    {
                        id: result.rows[0].id,
                        email
                    },
                        "P@ssw0rd123",
                    {
                        expiresIn: "1h"
                    }
                )
    
                result.rows[0].token = token
    
                return res.status(200).json(result.rows[0])
            }
            return res.status(400).send('Invalid credentials!')

        })

    }catch (err) {
        console.log(err)
    }
})



app.listen(port, () => {
    console.log(`server is up and running at port ${port}`)
})


