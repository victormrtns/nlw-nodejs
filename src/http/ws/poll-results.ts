import { FastifyInstance } from "fastify";
import { voting } from "../../utils/voting-pub-sub";
import {z} from 'zod'
import { json } from "stream/consumers";
export async function pollResults(app:FastifyInstance) {
    app.get('/polls/:pollId/results',{websocket:true},(connection,request)=>{
        connection.socket.on('message', (message:string) => {
            const getPollParams = z.object({
                pollId:z.string().uuid(),
            })
            //push the request and put then inside the createPollBody
            //The parse function will validate the data inside the request
            const {pollId} =getPollParams.parse(request.params)
            
            voting.subscribe(pollId,(message)=>{
                connection.socket.send(JSON.stringify(message))
            })
        })
    })
}