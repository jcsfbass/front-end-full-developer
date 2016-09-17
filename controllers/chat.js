const ConfigDatabase = require('../config/database');
const UsuarioRepository = require('../repositories/usuario');
const usuarioRepository = new UsuarioRepository(ConfigDatabase.uri);
const ChatRepository = require('../repositories/chat');
const chatRepository = new ChatRepository(ConfigDatabase.uri);

const ChatController = {
	chat: (req, res) => res.render('chat'),
	mensagens: (req, res) => {
		const currentUserId = req.session.user.id;
		const friendUserId = req.params.id;

		chatRepository.search(currentUserId, friendUserId, chat => {
			if (!chat) {
				res.json([]);
				return;
			}
			
			ChatController.transformMensagens(chat, transformedChat => res.json(transformedChat.mensagens));
		});
	},
	addMensagem: (req, res) => {
		const currentUserId = req.session.user.id;
		const friendUserId = req.params.id;
		const texto = req.body.texto;

		chatRepository.search(currentUserId, friendUserId, chat => {
			if (chat) {
				chatRepository.addMensagem(currentUserId, chat, texto, newChat => {
					ChatController.transformMensagens(newChat, transformedChat => res.json(transformedChat));
				});
			}
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
				}, chat => {
					ChatController.transformMensagens(chat, transformedChat => res.json(transformedChat));
				});
			}
		});
	},
	transformMensagens: (chat, callback) => {
		usuarioRepository.findMany(chat.usuarios, usuarios => {
			chat.mensagens = chat.mensagens.map(mensagem => {
				mensagem.usuario = usuarios.find(usuario => usuario._id == mensagem.usuario).nome;
				return mensagem;
			});
			callback(chat);
		});
	}
}

module.exports = ChatController;
