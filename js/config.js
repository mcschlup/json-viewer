// js/config.js
// Configuration for the JSON Viewer application

const CONFIG = {
  // URL parameter name containing the JSON data
  urlParam: 'data',

  // Highlight rules based on a specific KEY + VALUE combination (checked first, most specific).
  // testKey(key) and testValue(value) must both return true for the rule to apply.
  // Use the generic CSS classes hl-red / hl-orange / hl-yellow / hl-green / hl-blue.
  keyValueHighlightRules: [
    {
      testKey:   (key)   => key === 'anomaly_severity_level',
      testValue: (value) => String(value).toLowerCase() === 'critical',
      cssClass: 'hl-red'
    },
    {
      testKey:   (key)   => key === 'anomaly_severity_level',
      testValue: (value) => String(value).toLowerCase() === 'high',
      cssClass: 'hl-orange'
    },
    {
      testKey:   (key)   => key === 'anomaly_severity_level',
      testValue: (value) => String(value).toLowerCase() === 'medium',
      cssClass: 'hl-yellow'
    },
    {
      testKey:   (key)   => key === 'anomaly_severity_level',
      testValue: (value) => String(value).toLowerCase() === 'low',
      cssClass: 'hl-green'
    },
    {
      testKey:   (key)   => key === 'anomaly_severity_level',
      testValue: (value) => String(value).toLowerCase() === 'informational',
      cssClass: 'hl-blue'
    },
    {
      testKey:   (key)   => key === 'user_is_risky_person',
      testValue: (value) => String(value).toLowerCase() === 'executive',
      cssClass: 'hl-red'
    },
    {
      testKey:   (key)   => key === 'user_is_risky_person',
      testValue: (value) => /(Executive|Leaving Employee|Domain Admin)/.test(String(value).toLowerCase()),
      cssClass: 'hl-red'
  //  },
  //  {
  //    testKey:   (key)   => key === 'anomaly_analysis_status',
  //    testValue: (value) => String(value).toLowerCase() === 'open',
  //    cssClass: 'hl-orange'
  //  },
  //  {
  //    testKey:   (key)   => key === 'anomaly_analysis_status',
  //    testValue: (value) => String(value).toLowerCase() === 'closed',
  //    cssClass: 'hl-green'
    }
  ],

  // Highlight rules based on field VALUE patterns (fallback when no key+value rule matches)
  valueHighlightRules: [
    {
      test: (value) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(String(value)),
      cssClass: 'hl-time'
  //  },
  //  {
  //    test: (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value)),
  //    cssClass: 'hl-id'
    }
  ]
};
