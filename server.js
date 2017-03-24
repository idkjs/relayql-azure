import fs from 'fs'
import express from 'express'
import Schema from './data/schema'
import GraphQLHTTP from 'express-graphql'
import { graphql } from 'graphql'
import { introspectionQuery } from 'graphql/utilities'
import { MongoClient } from 'mongodb'
import { MONGO_URL, expressPort } from './config'

let app = express()

app.use(express.static('public'));

(async () => {
  try {
    let db = await MongoClient.connect(MONGO_URL)
    let schema = Schema(db)

    app.use('/graphql', GraphQLHTTP({
      schema,
      graphiql: true
    }))

    app.listen(expressPort, () => console.log(`The server is listening at http://localhost:${expressPort}/`))

  //  Generate schema.json
    let json = await graphql(schema, introspectionQuery)
    fs.writeFile('./data/schema.json', JSON.stringify(json, null, 2), err => {
      if (err) throw err

      console.log('JSON schema created')
    })
  } catch (e) {
    console.log(e)
  }
})()

