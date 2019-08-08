var amqp = require('amqplib/callback_api');

function sendRequest2RabbitMQ(message){

    // Convert obj to string
    var msg = JSON.stringify(message);
    console.log(msg);

    amqp.connect('amqp://localhost', function(error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }

            var queue = 'reprocessListTest';
            //var msg = 'Hello World Second';

            channel.assertQueue(queue, {
                durable: false,
                maxPriority: 10
            });
            channel.sendToQueue(queue, Buffer.from(msg), {'priority': msg.priority});

            console.log(" [x] Sent %s", msg);
        });
        setTimeout(function() {
            connection.close();
            //process.exit(0);
        }, 500);
    });
}

module.exports = sendRequest2RabbitMQ;

/*
var message = {};
message.name = 'Zachery',
message.age = 32121;
messageString = JSON.stringify(message);
console.log(message);
console.log(messageString);
console.log(JSON.parse(messageString));

sendRequest2RabbitMQ(messageString);
*/