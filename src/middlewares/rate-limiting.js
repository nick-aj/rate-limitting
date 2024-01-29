'use strict';

/**
 * `rate-limiting` middleware
 */

const rateLimit = require('koa2-ratelimit').RateLimit;
const { RateLimitError } = require('@strapi/utils').errors;

module.exports = (config, { strapi }) => {
  // Default values for default configuration
  return async (ctx, next) => {
    const init = {
      enabled: true, 
      interval: { min: 1 },
      max: 5, 
    }

    // Fetch existing configuration or use default
    const ratelimitConfig = strapi.config.get('plugin.users-permissions.ratelimit') || init;
    // Set enabled to true if not present
    if (!ratelimitConfig.hasOwnProperty('enabled')) ratelimitConfig.enabled = true;

    // If enabled
    if (ratelimitConfig.enabled) {
      const loadConfig = {
        prefixKey: ctx.request.ip, // Track requests per IP
        handler() {
          throw new RateLimitError("Too many requests, limit exceeded!", {
            policy: "rate-limit"
          });
        },
        // Spread default server configuration
        ...ratelimitConfig,
        ...config,
      }

      // Initialize the middleware loading the config
      return rateLimit.middleware(loadConfig)(ctx, next);
    }

    await next();
  };
};
