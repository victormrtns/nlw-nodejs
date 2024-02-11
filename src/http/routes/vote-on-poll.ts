import fastify, { FastifyInstance } from 'fastify'
import {z} from 'zod'
import {randomUUID} from 'node:crypto'
import { PrismaClient } from '@prisma/client'
import {prisma} from '../../lib/prisma'
export async function voteOnPoll(app: FastifyInstance) {
    app.post('/polls/:pollId/votes',async (request,reply)=> {
        const VoteOnPollBody = z.object({
            pollOptionId:z.string().uuid()
        })

        const VoteOnPollParams = z.object({
            pollId:z.string().uuid()
        })
        //push the request and put then inside the createPollBody
        //The parse function will validate the data inside the request
        const {pollId} = VoteOnPollParams.parse(request.params)
        const {pollOptionId} = VoteOnPollBody.parse(request.body)
        
        let {sessionId} = request.cookies

        if(sessionId){
            const userAlreadyVotedOnPoll = await prisma.vote.findUnique({
                where:{
                    sessionId_pollId:{
                        sessionId,
                        pollId
                    }
                }
            })
            if(userAlreadyVotedOnPoll && userAlreadyVotedOnPoll.pollOptionId != pollOptionId){
                // Delete this record
                await prisma.vote.delete({
                    where:{
                        id:userAlreadyVotedOnPoll.id
                    }
                })

            }    
            else{
                return reply.status(400).send({message:'You already voted on this poll!'})
            }
        }


        if(!sessionId){
            sessionId = randomUUID()
            reply.setCookie('sessionId',sessionId,{
                path:'/',
                maxAge: 60 * 60 * 24 * 30,
                signed:true,
                httpOnly:true
            })
        }

        await prisma.vote.create({
            data:{
                sessionId,
                pollId,
                pollOptionId,
            }
        })
        
        return reply.status(201).send()
    }) 
}