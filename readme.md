
# UDP Socket Connection Project

This project demonstrates the usage of **UDP sockets** for communication between a **server** and **client**. It handles client connections, authentication, command execution, and timeout management. 

## Features

- **UDP Server**: The server listens for incoming messages from clients and processes commands.
- **Client Authentication**: Clients must provide a username and password to connect to the server.
- **Command Handling**: Clients can send commands to the server, including reading/writing files, executing commands (admin only), and viewing client lists.
- **Timeout Management**: Inactive clients are disconnected after a certain period of inactivity.
- **Audit Logging**: All interactions are logged in an audit file with timestamps for tracking purposes.
- **Admin Privileges**: Only administrators can execute certain commands, such as writing to protected files and kicking clients.

  ## Technologies Used

- **Node.js**: The server-side implementation uses Node.js to handle UDP communication.
- **UDP (User Datagram Protocol)**: For fast, connectionless communication.
- **JSON**: For sending data between the server and clients in a structured format.

## Steps to Use
 1.First, clone the repository to your local machine using Git:
 ```bash
 git clone https://github.com/fatjetagashi/Projekti-2-RrjetaKompjuterike.git
  ```
     
2. Place the project folder on your computer.
3. Open a terminal, navigate to the project folder, and start the server with: **node server.js**
4. Open a new terminal, navigate to the same project folder, and start a client with: **node client.js**
5. Once authenticated, use the client terminal to send commands to the server, and the server will process and respond accordingly.
