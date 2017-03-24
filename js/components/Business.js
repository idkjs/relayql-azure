
import React from 'react'
import Relay from 'react-relay'
import moment from 'moment'

import ThumbsUpMutation from '../mutations/ThumbsUpMutation'

class Business extends React.Component {
  dateStyle = () => ({
    color: '#888',
    fontSize: '0.7em',
    marginRight: '0.5em'
  });

  urlStyle = () => ({
    color: '#062',
    fontSize: '0.85em'
  });

  dateLabel = () => {
    let {business, relay} = this.props
    if (relay.hasOptimisticUpdate(business)) {
      return 'Saving...'
    }
    return moment(business.createdAt).format('L')
  }
  
  url = () => {
    return this.props.business.url.replace(/^https?:\/\/|\/$/ig, '')
  };

  thumbsUpClick = () => {
    // let { business } = this.props
    Relay.Store.commitUpdate(
      new ThumbsUpMutation({
        business: this.props.business
      })
    )
  }

  showLikes = () => {
    this.props.relay.setVariables({ showLikes: true })
  }
  displayLikes () {
    if (!this.props.relay.variables.showLikes) {
      return null
    }
    return <div className="collection-item">
      {this.props.business.likesCount} &nbsp;
      <i className="material-icons vertical-align-middle" onClick={this.thumbsUpClick}>thumb_up</i>
    </div>
  }

  render () {
    let { business } = this.props
    return (
      <li>
        <div className="card-panel" style={{padding: '1em'}} onClick={this.showLikes}>
        <a href={business.url}>{business.name}</a>
          <div className="truncate">
            <span style={this.dateStyle()}>
              {this.dateLabel()}
            </span>
            <a href={business.url} style={this.urlStyle()}>
            {this.url()}
            </a>
            {this.displayLikes()}
          </div>
        </div>
      </li>
    )
  }
}

// Declare the data reqs for this component.
Business = Relay.createContainer(Business, {
  initialVariables: {
    showLikes: false
  },
  fragments: {
    business: () => Relay.QL`
      fragment on Business {
          ${ThumbsUpMutation.getFragment('business')}
          name,
          url,
          createdAt,
          likesCount @include(if: $showLikes),
        }
    `
  }
})

export default Business
