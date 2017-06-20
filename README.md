This is the command line python application with Node.js server

Server side code(app.js):
- Set up the ssl connection with the localhost, port no.8000
- Accepts the request from client side python program through command line application.
- process each of the four request and submit the response in json

client side code(client.py):
- use python sys module as a command line tool
- define the command handler for all the commands in the list
- http-requests the server running on the local machine to get the response

text file(alltests.txt):
- has the entire json as an output which is used by all the command function in server side


