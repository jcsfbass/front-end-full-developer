const Repository = require('./repository');
const ObjectId = require('mongodb').ObjectId;

class UsuarioRepository extends Repository {
	constructor(mongoURI) {
		super(mongoURI);
		this.collectionName = 'usuarios';
	}

	solicitacoes(id, callback) {
		this.findOne(id, usuario => {
			if (usuario.solicitacoes.length === 0) {
				callback([]);
				return;
			}

			const query = usuario.solicitacoes.map(solicitacao => {
				return {'_id': new ObjectId(solicitacao)};
			});

			this.where({$or: query}, usuarios => callback(usuarios));
		});
	}
}

module.exports = UsuarioRepository;
