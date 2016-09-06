const Repository = require('./repository');

class ChatRepository extends Repository {
	constructor(mongoURI) {
		super(mongoURI);
		this.collectionName = 'chats';
	}

	mensagens(userId, friendUserId, callback) {
		this.all(chats => {
			const chat = chats.find(chat => {
				const usuarios = new Set(chat.usuarios);
				return usuarios.has(userId) && usuarios.has(friendUserId);
			});

			if (chat) callback(chat.mensagens);
			else callback([]);
		});
	}
}

module.exports = ChatRepository;
