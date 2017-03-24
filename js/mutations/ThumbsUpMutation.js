
import Relay from 'react-relay'

class ThumbsUpMutation extends Relay.Mutation {
  // use static property to have this class tell us
  // what its requirements are, what data it needs to
  // run correctly. Add likeCount to fragments since we are now depending on the existence of and want to make sure to get it before running that code.
  static fragments = {
    business: () => Relay.QL`
      fragment on Business {
          id,
          likesCount
      }
    `
  }

  getMutation () {
    return Relay.QL`
      mutation { thumbsUp }
    `
  }

  // specify all fields in our Relay Store that could have changed due to the mutation
  getFatQuery () {
    return Relay.QL`
      fragment on ThumbsUpPayload {
          business {
              likesCount
          }
      }
    `
  }

  getConfigs () {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          business: this.props.business.id
        }
      }
    ]
  }

  // Use this method to prepare the variables that will be used as
  // input to the mutation. Our 'thumbsUp' mutation takes exactly
  // one variable as input – the businessId of the business to like.

  getVariables () {
    return {
      businessId: this.props.business.id
    }
  }

  // add optimistic response to make it look like the count incremented before the server response comes back. This make it look super fast to the user so better UX. This is a temporary response until the server actually responds.

  getOptimisticResponse () {
    return {
      business: {
        id: this.props.business.id,
        likesCount: this.props.business.likesCount + 1
      }
    }
  }
}

export default ThumbsUpMutation
