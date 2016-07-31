Vue.use(VueResource);

new Vue({
	el: '#postagens',
	ready: function() {
		this.$http.get('/postagens').then(function(response){
			this.$set('postagens', response.data);
		});
	}
});