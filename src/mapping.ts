import {
  TokenURIUpdated as TokenURIUpdatedEvent,
  Transfer as TransferEvent,
  Token as TokenContract,
} from '../generated/Token/Token'

import { Token, User } from '../generated/schema'

export function handleTransfer(event: TransferEvent): void {
  // load the token from the graph node
  let token = Token.load(event.params.tokenId.toString())

  // create a new token if it doesn't exist
  if (!token) {
    token = new Token(event.params.tokenId.toString())
    token.creator = event.params.to.toHexString()
    token.tokenID = event.params.tokenId
    token.createdAtTimestamp = event.block.timestamp

    // call out to the token contract to get and set the content URI and metadata URI
    let tokenContract = TokenContract.bind(event.address)
    token.contentURI = tokenContract.tokenURI(event.params.tokenId)
    token.metadataURI = tokenContract.tokenMetadataURI(event.params.tokenId)
  }

  // set the token owner and save it to the store
  token.owner = event.params.to.toHexString()
  token.save()

  // check to see if the user exists
  let user = User.load(event.params.to.toHexString())
  // if not, create a new user
  if (!user) {
    user = new User(event.params.to.toHexString())
    user.save()
  }
}

// update the content URI of the token
// then save it back to the store
export function handleTokenURIUpdated(event: TokenURIUpdatedEvent): void {
  let token = Token.load(event.params._tokenId.toString())
  token.contentURI = event.params._uri
  token.save()
}
