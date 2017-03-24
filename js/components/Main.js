import React from 'react'
import Relay from 'react-relay'
import { debounce } from 'lodash'

import Business from './Business'
import CreateBusinessMutation from '../mutations/CreateBusinessMutation'

class Main extends React.Component {
  constructor (props) {
    super(props)
    this.setVariables = debounce(this.props.relay.setVariables, 300)
  }

  search = (e) => {
    this.setVariables({ query: e.target.value })
  };

  setLimit = (e) => {
    this.setVariables({ limit: Number(e.target.value) })
  };
  
  handleSubmit = (e) => {
    e.preventDefault()
    let onSuccess = () => {
      $('#modal').closeModal()
    }
    let onFailure = (transaction) => {
      var error = transaction.getError() || new Error('Mutation failed.')
      console.error(error)
    }
    Relay.Store.commitUpdate(
      new CreateBusinessMutation({
        name: this.refs.newName.value,
        url: this.refs.newUrl.value,
        store: this.props.store
      }),
      {onFailure, onSuccess}
    );
    this.refs.newName.value = "";
    this.refs.newUrl.value = "";
  }

  componentDidMount () {
    $('.modal-trigger').leanModal()
  }

  render () {
    let content = this.props.store.businessConnection.edges.map(edge => {
      return <Business key={edge.node.id} business={edge.node} />
    })
    return (
      <div>
        <div className="input-field">
          <input id="search" type="text" onChange={this.search} />
          <label htmlFor="search">Search All Businesses</label>
        </div>

        <div className="row">
          <a className="waves-effect waves-light btn modal-trigger right light-blue white-text" href="#modal">Add New Business</a>
        </div>

        <ul>
          {content}
        </ul>

        <div className="row">
          <div className="col m3 hide-on-small-only">
            <div className="input-field">
              <select id="showing" className="browser-default"
                onChange={this.setLimit} defaultValue={this.props.relay.variables.limit}>
                <option value="100">Show 100</option>
                <option value="200">Show 200</option>
              </select>
            </div>
          </div>
        </div>

        <div id="modal" className="modal modal-fixed-footer">
          <form onSubmit={this.handleSubmit}>
            <div className="modal-content">
              <h5>Add New Business</h5>
              <div className="input-field">
                <input type="text" id="newName" ref="newName" required className="validate" />
                <label htmlFor="newName">Name</label>
              </div>
              <div className="input-field">
                <input type="url" id="newUrl" ref="newUrl" required className="validate" />
                <label htmlFor="newUrl">Url</label>
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="waves-effect waves-green btn-flat green darken-3 white-text">
                <strong>Add</strong>
              </button>
              <a href="#!" className="modal-action modal-close waves-effect waves-red btn-flat">Cancel</a>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

Main = Relay.createContainer(Main, {
  initialVariables: {
    limit: 100,
    query: ''
  },
  fragments: {
    store: () => Relay.QL`
      fragment on Store {
        id,
        businessConnection(first: $limit, query: $query) {
          edges {
            node {
              id,
              ${Business.getFragment('business')}
            }
          }
        }
      }
    `
  }
})

export default Main
