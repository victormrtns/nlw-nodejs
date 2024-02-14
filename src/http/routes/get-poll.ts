import fastify, { FastifyInstance } from 'fastify'
import {z} from 'zod'
import { PrismaClient } from '@prisma/client'
import {prisma} from '../../lib/prisma'
import {redis} from '../../lib/redis'
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

        if(!poll){
            reply.status(404).send({message:'Poll Not Found'})
        }

        const result = await redis.zrange(pollId,0,-1,'WITHSCORES')
        
        const votes = result.reduce((obj,line,index)=>{
            if(index % 2 === 0){
                const score = result[index+1] 
                Object.assign(obj,{[line]:score})
            }
            return obj
        },{} as Record<string,number>)

        console.log(votes)

        return reply.send({
                poll:{
                    id:poll?.id,
                    title:poll?.title,
                    options:poll?.options.map(option=>{
                        return{
                            id:option.id,
                            title:option.title,
                            score:(option.id in votes) ? votes[option.id]:0,
                        }
                    })

                }
        
            })
    }) 
}