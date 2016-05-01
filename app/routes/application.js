import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    login(providerName) {
  return this.get('toriiSession').open(providerName)
      .then(() => this.transitionTo('world'));
},

logout() {
  return this.get('toriiSession').close()
      .then(() => this.transitionTo('index'));
},

accessDenied() {
  return this.transitionTo('index');
}
}
});
