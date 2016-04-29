import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service('toriiSession'),
  actions: {
    authenticateWithFacebook() {
      this.get('session').authenticate('authenticator:torii', 'facebook');
    }
  }
});
