const UsuarioRepository = require('../repositories/usuario');
const usuarioRepository = new UsuarioRepository('mongodb://localhost:27017/jedi');
const ChatRepository = require('../repositories/chat');
const chatRepository = new ChatRepository('mongodb://localhost:27017/jedi');

const ChatController = {
	chat: (req, res) => res.render('chat'),
	mensagens: (req, res) => {
		chatRepository.all(chats => {
			const currentUserId = req.session.user.id;
			const friendUserId = req.params.id;

			chatRepository.search(currentUserId, friendUserId, chat => {
				usuarioRepository.findMany([currentUserId, friendUserId], usuarios => {
					if (!chat) {
						res.json([]);
						return;
					}

					res.json(chat.mensagens.map(mensagem => {
						mensagem.usuario = usuarios.find(usuario => usuario._id == mensagem.usuario).nome;
						return mensagem;
					}));
				});
			});
		});
	},
	addMensagem: (req, res) => {
		const currentUserId = req.session.user.id;
		const friendUserId = req.params.id;
		const texto = req.body.texto;

		chatRepository.search(currentUserId, friendUserId, chat => {
			if (chat) chatRepository.addMensagem(currentUserId, chat, texto, () => res.json(chat));
			else {
				chatRepository.create({
					usuarios: [
						currentUserId,
						friendUserId
					],
					mensagens: [
						{
							usuario: currentUserId,
							texto: texto
						}
					]
				}, chat => res.json(chat));
			}
		});
	}
}

module.exports = ChatController;
