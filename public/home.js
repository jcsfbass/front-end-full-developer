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
		}
	},
	ready: function() {
		this.$http.get('/postagens').then(function(response){
			this.$set('postagens', response.data);
		});

		this.$http.get('/pessoas').then(function(response){
			this.$set('pessoas', response.data);
		});		
	}
});

