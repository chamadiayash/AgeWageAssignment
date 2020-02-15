# AgeWageAssignment
Assignment for Agewage


Use environment variables while running the server to connect to the database

Example usage : 


HOST='DATABASEHOSTNAME' USER='USERNAME' PASSWORD='USERPASSWORD' DATABASE='DATABASENAME' node index.js



Endpoint Examples
Note: There is only one endpoint. However, for filtering, three samples with query params are
given.

Endpoint: /cost-explorer
Output: Cost data of all clients and their projects

Endpoint: /cost-explorer?clients[]=1&clients[]=2
Output: Cost data of clients 1 and 2, and their projects

Endpoint: /cost-explorer?clients[]=1&clients[]=2&projects[]=1
Output: Cost data of project 1 for clients 1 and 2 (Note that project 1 belongs to Client 1 only)

Endpoint: /cost-explorer?cost_types[]=1&cost_types[]=2&cost_types[]=3
Output: Cost data with cost types 1, 2, and 3, for all clients (and their projects)
