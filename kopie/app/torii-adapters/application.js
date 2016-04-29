// app/torii-adapters/application.js
import Ember from 'ember';

export default Ember.Object.extend({
  providerName: null,

  init(providerName) {
  this._super();
  this.providerName = providerName;
},

open(authentication) {
  var authorizationCode = authentication.authorizationCode;
  return new Ember.RSVP.Promise((resolve, reject) => Ember.$.ajax({
      dataType: 'json',
      method: 'POST',
      url: '/api/session/start',
      contentType: 'application/json',
      data: JSON.stringify(authentication),
      processData: false,
      success: Ember.run.bind(null, resolve),
      error: Ember.run.bind(null, reject)
    }));
},

fetch() {
  return new Ember.RSVP.Promise((resolve, reject) => Ember.$.ajax({
      dataType: 'json',
      method: 'GET',
      url: '/api/session/info',
      success: Ember.run.bind(null, resolve),
      error: Ember.run.bind(null, reject)
    }));
},

close() {
  return new Ember.RSVP.Promise((resolve, reject) => Ember.$.ajax({
      dataType: 'json',
      method: 'POST',
      url: '/api/session/end',
      success: Ember.run.bind(null, resolve),
      error: Ember.run.bind(null, reject)
    }));
}
});
