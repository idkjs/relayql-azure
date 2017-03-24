import Relay from 'react-relay'

class CreateBusinessMutation extends Relay.Mutation {
  getMutation () {
    return Relay.QL`
      mutation { createBusiness }
    `
  }

  getVariables () {
    return {
      name: this.props.name,
      url: this.props.url
    }
  }

  getFatQuery () {
    return Relay.QL`
      fragment on CreateBusinessPayload {
        businessEdge,
        store { businessConnection }
      }
    `
  }

  getConfigs () {
    return [
      {
        type: 'RANGE_ADD',
        parentName: 'store',
        parentID: this.props.store.id,
        connectionName: 'businessConnection',
        edgeName: 'businessEdge',
        rangeBehaviors: {
          '': 'prepend'
        }
      }
    ]
  }

  getOptimisticResponse () {
    return {
      businessEdge: {
        node: {
          name: this.props.name,
          url: this.props.url
        }
      }
    }
  }
}

export default CreateBusinessMutation
