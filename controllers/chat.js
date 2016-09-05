const UsuarioRepository = require('../repositories/usuario');
const usuarioRepository = new UsuarioRepository('mongodb://localhost:27017/jedi');
const ChatRepository = require('../repositories/chat');
const chatRepository = new ChatRepository('mongodb://localhost:27017/jedi');

const ChatController = {
	chat: (req, res) => {
		if (req.session.user) res.render('chat');
		else res.redirect('/');
	},
	mensagens: (req, res) => {
		chatRepository.all(chats => {
			const currentUserId = req.session.user.id;
			const friendUserId = req.params.id;

			for (let i = 0; i < chats.length; i++) {
				let usuarios = new Set(chats[i].usuarios);
				if (usuarios.has(currentUserId) &&
					usuarios.has(friendUserId)) {

					usuarioRepository.findOne(currentUserId, currentUser => {
						usuarioRepository.findOne(friendUserId, friendUser => {
							const mensagens = chats[i].mensagens.map(mensagem => {
								if (currentUserId == mensagem.usuario) mensagem.usuario = currentUser.nome;
								else mensagem.usuario = friendUser.nome;

								return mensagem;
							});

							res.json(mensagens);
						});
					});
				}
			}
		});
	},
	addMensagem: (req, res) => {
		chatRepository.all(chats => {
			let chat;
			const currentUserId = req.session.user.id;
			const friendUserId = req.params.id;

			for (let i = 0; i < chats.length; i++) {
				let usuarios = new Set(chats[i].usuarios);
				if (usuarios.has(currentUserId) &&
					usuarios.has(friendUserId)) {
					chat = chats[i];
					break;
				}
			}

			if (chat) {
				chat.mensagens.push({
					usuario: req.session.user.id,
					texto: req.body.texto
				});

				chatRepository.update(chat._id, {mensagens: chat.mensagens}, () => {
					res.json({mensagens: chat.mensagens});
				});
			} else {
				const newChat = {
					usuarios: [
						currentUserId,
						friendUserId
					],
					mensagens: [
						{
							usuario: currentUserId,
							texto: req.body.texto
						}
					]
				};

				chatRepository.create(newChat, chat => res.json(chat));
			}
		});
	}
}

module.exports = ChatController;
