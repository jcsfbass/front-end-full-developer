const Repository = require('./repository');

class ChatRepository extends Repository {
	constructor(mongoURI) {
		super(mongoURI);
		this.collectionName = 'chats';
	}

	search(userId, friendUserId, callback) {
		this.all(chats => {
			const chat = chats.find(chat => {
				const usuarios = new Set(chat.usuarios);
				return usuarios.has(userId) && usuarios.has(friendUserId);
			});

			if (chat) callback(chat);
			else callback(undefined);
		});
	}

	addMensagem(id, chat, texto, callback) {
			chat.mensagens.push({
				usuario: id,
				texto: texto
			});

			this.update(chat._id, {mensagens: chat.mensagens}, () => callback(chat));
	}
}

module.exports = ChatRepository;
