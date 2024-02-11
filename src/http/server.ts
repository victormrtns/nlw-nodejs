import fastify from 'fastify'
import {z} from 'zod'
import { createPoll } from './routes/create-poll'
import { getPoll } from './routes/get-poll'
import { voteOnPoll } from './routes/vote-on-poll'
import cookie from '@fastify/cookie'
const app = fastify()

app.register(cookie,{
    secret: "poll-app-nlw", // for cookies signature
    hook: 'onRequest', // set to false to disable cookie autoparsing or set autoparsing on any of the following hooks: 'onRequest', 'preParsing', 'preHandler', 'preValidation'. default: 'onRequest'
    parseOptions: {}  // options for parsing cookies
})
app.register(createPoll)
app.register(getPoll)
app.register(voteOnPoll)
app.listen({port:3333}).then(()=>{
    console.log('HTTP Server Running')
})