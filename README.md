About project: 
================

- This poc(proof of concept) to explain about view materialized.


What's view materialized:
==========================

The view materialized is one table where result is processed different the view when you execute view under hood execute complex queries, but the view materialized not after execute command to process data when execute view materialized return result already processed

Instructions to running application:
====================================
- Clone project
- Access **frontend**
- Execute command **npm i**
- Execute command **npm run start**
- Access **server**
- Execute command **npm i**
- Execute command **docker-compose up -d**
- Execute command **node ./importCsvToDatabase.js && node ./addLatLongToCountry.js**
- Execute command **node ./index.js**