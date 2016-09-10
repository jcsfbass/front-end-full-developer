const Repository = require('./repository');
const ObjectId = require('mongodb').ObjectId;

class UsuarioRepository extends Repository {
	constructor(mongoURI) {
		super(mongoURI);
		this.collectionName = 'usuarios';
	}

	solicitacoes(id, callback) {
		this.usuarios(id, 'solicitacoes', callback);
	}

	amigos(id, callback) {
		this.usuarios(id, 'amigos', callback);
	}

	pessoas(id, callback) {
		this.all(usuarios => {
			const usuario = usuarios.find(doc => doc._id == id);

			const known = usuario.amigos.concat(id);
			const unknown = [];

			usuarios.forEach(doc => {
				const some = known.some(usuarioId => doc._id == usuarioId);

				if (!some) unknown.push(doc);
			});

			callback(unknown);
		});
	}

	postagens(id, callback) {
		this.findOne(id, usuario => {
			this.findMany(usuario.amigos, amigos => {
				let postagens = usuario.posts.map(post => {
					post.id = usuario._id;
					post.nome = usuario.nome;

					return post;
				});

				amigos.forEach(amigo => {
					let postagensDoAmigo = amigo.posts.map(post => {
						post.id = amigo._id;
						post.nome = amigo.nome;

						return post;
					});

					postagens = postagens.concat(postagensDoAmigo);
				});

				callback(postagens.sort((current, next) => {
				  if (current.data > next.data) return -1;
				  if (current.data < next.data) return 1;

				  return 0;
				}));
			});
		});
	}

	createPostagem(id, texto, callback) {
		this.findOne(id, usuario => {
			const postagem = {texto: texto, data: new Date()};
			const postagens = usuario.posts;
			postagens.unshift(postagem);

			this.update(id, {'posts': postagens}, () => {
				postagem.id = usuario._id;
				postagem.nome = usuario.nome;
				
				callback(postagem);
			});		
		});
	}

	addSolicitao(id, unknownPessoa, callback) {
		this.solicitacoes(id, solicitacoes => {
			solicitacoes.push(unknownPessoa);

			this.update(id, {'solicitacoes': solicitacoes}, callback);
		});
	}

	addAmigo(id, amigoId, callback) {
		this.findOne(id, usuario => {
			const solicitacoes = new Set(usuario.solicitacoes);
			const amigos = new Set(usuario.amigos);

			solicitacoes.delete(amigoId);
			amigos.add(amigoId);

			this.update(id,
				{
					'solicitacoes': Array.from(solicitacoes),
					'amigos': Array.from(amigos)
				},
				() => callback(amigos)
			);
		});
	}

	usuarios(id, field, callback) {
		this.findOne(id, usuario => {
			if (usuario[field].length === 0) {
				callback([]);
				return;
			}

			this.findMany(usuario[field], usuarios => callback(usuarios));
		});
	}
}

module.exports = UsuarioRepository;
