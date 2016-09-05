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

	usuarios(id, field, callback) {
		this.findOne(id, usuario => {
			if (usuario[field].length === 0) {
				callback([]);
				return;
			}

			const query = usuario[field].map(anotherUsuario => {
				return {'_id': new ObjectId(anotherUsuario)};
			});

			this.where({$or: query}, usuarios => callback(usuarios));
		});
	}
}

module.exports = UsuarioRepository;
