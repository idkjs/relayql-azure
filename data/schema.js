
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLNonNull
} from 'graphql'

import {
  fromGlobalId,
  nodeDefinitions,
  connectionDefinitions,
  connectionArgs,
  connectionFromPromisedArray,
  mutationWithClientMutationId,
  globalIdField
} from 'graphql-relay'

// enable nodeInterface get id from mongodb ObjectID
const { ObjectID } = require('mongodb')

// turn schema into a function so that we can pass db var into it.
let Schema = db => {
  class Store {}
  let store = new Store()

  let nodeDefs = nodeDefinitions(
    (globalId) => {
      let { type } = fromGlobalId(globalId)
      if (type === 'Store') {
        return store
      } else {
        return null
      }
    },
    (obj) => {
      if (obj instanceof Store) {
        return storeType
      } else {
        return null
      }
    }
  )

  let storeType = new GraphQLObjectType({
    name: 'Store',
    fields: () => ({
      id: globalIdField('Store'),
      businessConnection: {
        type: businessConnection.connectionType,
        args: {
          ...connectionArgs,
          query: { type: GraphQLString }
        },
        resolve: (_, args) => {
          let findParams = {}
          if (args.query) {
            findParams.name = new RegExp(args.query, 'i')
          }
          if (!args.limit || args.limit > 200) {
            args.limit = 100
          }
          return connectionFromPromisedArray(
            db.collection('businesses')
              .find({ $query: findParams, $orderby: { createdAt: -1 } })
              .limit(args.first).toArray(),
            args
          )
        }
      }
    }),
    interfaces: [nodeDefs.nodeInterface]
  })

  let businessType = new GraphQLObjectType({
    name: 'Business',
    interfaces: [nodeDefs.nodeInterface],
    fields: () => ({
      id: globalIdField('Business', (obj) => obj._id),
      name: { type: GraphQLString },
      url: { type: GraphQLString },
      state: { type: GraphQLString },
      likesCount: { type: GraphQLInt },
      createdAt: {
        type: GraphQLString,
        resolve: (obj) => new Date(obj.createdAt).toISOString()
      }
    })
  })

  let businessConnection = connectionDefinitions({
    name: 'Business',
    nodeType: businessType
  })

  let createBusinessMutation = mutationWithClientMutationId({
    name: 'CreateBusiness',
    inputFields: {
      name: {type: new GraphQLNonNull(GraphQLString)},
      url: {type: new GraphQLNonNull(GraphQLString)}
    },
    outputFields: {
      businessEdge: {
        type: businessConnection.edgeType,
        resolve: (obj) => ({ node: obj.ops[0], cursor: obj.insertedId })
      },
      store: {
        type: storeType,
        resolve: () => store
      }
    },
    mutateAndGetPayload: ({name, url}) => {
      // mutation logic goes here.
      return db.collection('businesses').insertOne({
        name,
        url,
        createdAt: Date.now()
      })
    }
  })

  let thumbsUpMutation = mutationWithClientMutationId({
    name: 'ThumbsUp',
    inputFields: {
      businessId: { type: GraphQLString }
    },
    outputFields: {
      business: {
        type: businessType,
        resolve: obj => obj
      }
    },
    mutateAndGetPayload: (params) => {
      const { id } = fromGlobalId(params.businessId)
      return Promise.resolve(
      db.collection('businesses').updateOne({ _id: ObjectID(id) },
        { $inc: { likesCount: 1 } }
      )
    ).then(result =>
    db.collection('businesses').findOne(ObjectID(id)))
    }
  })

  let schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: () => ({
        node: nodeDefs.nodeField,
        store: {
          type: storeType,
          resolve: () => store
        }
      })
    }),

    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: () => ({
        createBusiness: createBusinessMutation,
        thumbsUp: thumbsUpMutation
      })
    })
  })

  return schema
}

export default Schema
