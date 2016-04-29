import Ember from 'ember';

export default Ember.Route.extend({
  fb: Ember.inject.service(),

  beforeModel() {
    return this.get('fb').FBInit();
  }
});
