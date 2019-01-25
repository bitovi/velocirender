const debugOn = process.env.DEBUG != null || process.env.DONE_SSR_DEBUG != null;

exports.enabled = debugOn;