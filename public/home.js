Vue.use(VueResource);

new Vue({
	el: '#home',
	data: {
		texto: ''
	},
	methods: {
		post: function() {
			this.$http.post('/postagens', {texto: this.texto}).then(function(response){
				this.postagens.unshift(response.data);
			});		
		},
		solicitar: function(pessoa) {
			this.$http.get('/solicitar/' + pessoa._id).then(function(response){});
		},
		aceitar: function(pessoa) {
			this.$http.get('/aceitar/' + pessoa._id).then(function(response){
				var index = this.solicitacoes.indexOf(pessoa);
				this.solicitacoes.splice(index, 1);
			});
		}
	},
	ready: function() {
		this.$http.get('/postagens').then(function(response){
			this.$set('postagens', response.data);
		});

		this.$http.get('/pessoas').then(function(response){
			this.$set('pessoas', response.data);
		});

		this.$http.get('/amigos').then(function(response){
			this.$set('amigos', response.data);
		});

		this.$http.get('/solicitacoes').then(function(response){
			this.$set('solicitacoes', response.data);
		});
	}
});

