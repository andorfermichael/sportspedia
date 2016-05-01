/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'michael-andorfer-nico-deufemia-mmp2b-socialjourney',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },
    torii: {
      sessionServiceName: 'toriiSession',
      providers: {
        'facebook-oauth2': {
          apiKey: '188171371199457',
          scope: 'read_stream,user_posts',
          redirectUri: 'http://localhost:4200/world'
        }
      }
    },
    contentSecurityPolicy: {
      'default-src': "'none'",
      'script-src': "'self' 'unsafe-inline' 'unsafe-eval'",
      'font-src': "'self'",
      'connect-src': "'self'",
      'img-src': "'self'",
      'report-uri':"'localhost'",
      'style-src': "'self' 'unsafe-inline'",
      'frame-src': "'none'"
    },
    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    FB: {
      appId: '188171371199457',
      version: 'v2.3',
      scope: 'read_stream,user_posts',
      xfbml: true
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  return ENV;
};
