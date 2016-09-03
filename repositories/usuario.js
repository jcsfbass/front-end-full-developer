const Repository = require('./repository');

class UsuarioRepository extends Repository {
	constructor(mongoURI) {
		super(mongoURI);
		this.collectionName = 'usuarios';
	}

	
}

module.exports = UsuarioRepository;