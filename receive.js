var amqp = require('amqplib/callback_api');
const reprocess = require('./reprocess.js');

amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        var queue = 'reprocessListTest';

        channel.assertQueue(queue, {
            durable: false,
            maxPriority: 10
        });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

        // Accept 1 ack at a time, so we process one data each time
        channel.prefetch(1);

        /*
        channel.get(queue, {noAck: false}, function(err, msg){
            var Input = JSON.parse(msg.content.toString());
            console.log(Input);

            
            reprocess(Input, function(err){
                if(err){
                    console.error(err);
                }
                else{
                    console.log(`Processed reprocess for ${msg}`);
                }
            });
            

            channel.ack(msg);


        });
        */


        
        channel.consume(queue, function(msg) {
            //console.log(" [x] Received %s", msg.content.toString());
            
            var Input = JSON.parse(msg.content.toString());
            console.log(Input);
            reprocess(Input, (err) =>{
                if(err){
                    channel.nack(msg);
                }
                else{
                    console.log(`Processed reprocess for ${msg}`);
                    channel.ack(msg);
                }

            });
            
           
        }, {
            noAck: false
        });
        
        
    });
});