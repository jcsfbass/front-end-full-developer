const Repository = require('./repository');

class ChatRepository extends Repository {
	constructor(mongoURI) {
		super(mongoURI);
		this.collectionName = 'chats';
	}
}

module.exports = ChatRepository;
