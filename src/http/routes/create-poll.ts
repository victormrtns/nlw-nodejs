import fastify, { FastifyInstance } from 'fastify'
import {z} from 'zod'
import { PrismaClient } from '@prisma/client'
import {prisma} from '../../lib/prisma'
export async function createPoll(app: FastifyInstance) {
    app.post('/polls',async (request,reply)=> {
        //Create the object that will be manipulated
        const createPollBody = z.object({
            title: z.string(),
            options:z.array(z.string())
        })
        //push the request and put then inside the createPollBody
        //The parse function will validate the data inside the request
        const {title,options} = createPollBody.parse(request.body)
        //Create the poll
        const poll = await prisma.poll.create({
            data:{
                title,
                options:{
                    createMany:{
                        data:options.map(option=>{
                            return {title:option}
                        }),
                    }
                }
            }
        })

        // await prisma.pollOption.createMany({
        //     data:options.map(option=>{
        //         return {title:option,pollId:poll.id}
        //     }),
        // })
        return reply.status(201).send({pollId:poll.id})
    }) 
}