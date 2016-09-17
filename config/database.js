const ConfigDatabase = {
	uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/jedi'
};

module.exports = ConfigDatabase;