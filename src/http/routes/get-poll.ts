import fastify, { FastifyInstance } from 'fastify'
import {z} from 'zod'
import { PrismaClient } from '@prisma/client'
import {prisma} from '../../lib/prisma'
export async function getPoll(app: FastifyInstance) {
    app.get('/polls/:pollId',async (request,reply)=> {
        //Create the object that will be manipulated
        const getPollParams = z.object({
            pollId:z.string().uuid(),
        })
        //push the request and put then inside the createPollBody
        //The parse function will validate the data inside the request
        const {pollId} =getPollParams.parse(request.params)
        //Create the poll
        const poll = await prisma.poll.findUnique({
            where:{id:pollId},
            include:{options:{select:{id:true,title:true}}}
        })

        return reply.send({poll:poll})
    }) 
}