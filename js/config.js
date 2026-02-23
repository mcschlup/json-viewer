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
  //  {
  //    testKey:   (key)   => key === 'user_is_risky_person',
  //    testValue: (value) => String(value).toLowerCase() === 'executive',
  //    cssClass: 'hl-red'
  //  },
    {
      testKey:   (key)   => key === 'user_is_risky_person',
      testValue: (value) => /(Executive|Leaving Employee|Domain Admin)/.test(String(value)),
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

  // Field mappings: replace the raw key with a human-readable name and add a description
  // shown as a tooltip when hovering over the field label.
  // Each entry: { key, name, description }
  //   key         – exact field key to match
  //   name        – display name that replaces the raw key in the UI
  //   description – tooltip text shown on hover (optional)
  fieldMappings: [
    {
      key: 'risk_notable_title',
      name: 'Risk Notable',
      description: 'Title of this specific risk notable - contains the affected entity and a list of products that detected the correlated entities.'
    },
    {
      key: 'risk_notable_id',
      name: 'Risk Notable ID',
      description: 'Unique ID for this specific risk notable.'
    },
    {
      key: 'risk_notable_severity_level',
      name: 'Risk Notable Severity',
      description: 'Severity level of this specific risk notable.'
    },
    {
      key: 'entity',
      name: 'Prioritized Entity',
      description: 'The entity of this risk notable - may be either an asset (server, client, cloud account) or an identity (user, app registration). This is the "main character" of this risk notable.'
    },
    {
      key: 'entity_type',
      name: 'Entity Type',
      description: 'Type of the entity. Possible values: asset or identity.'
    },
    {
      key: 'entity_subtype',
      name: 'Entity Subtype',
      description: 'Subtype of the entity.'
    },
    {
      key: 'entity_risk_score',
      name: 'Entity Risk Score',
      description: 'The total risk score of this specific entity. This is the sum of the correlated anomalies\' individual score values multiplied by the different risk factors (Risk vulnerability factor, Risk impact factor and Risk GRC tool factor).'
    },
    {
      key: 'entity_market_unit',
      name: 'Entity Market Unit',
      description: 'Associated market unit of that specific entity.'
    },
    {
      key: 'all_market_units_in_anomalies',
      name: 'All Market Units',
      description: 'List of all market units that are somehow involved (i.e. all market units found in the correlated anomalies).'
    },
    {
      key: 'anomaly_first_time',
      name: 'Timestamp of oldest Anomaly',
      description: 'Timestamp of the first correlated anomaly.'
    },
    {
      key: 'anomaly_last_time',
      name: 'Timestamp of newest Anomaly',
      description: 'Timestamp of the last correlated anomaly.'
    },
    {
      key: 'anomaly_overview',
      name: 'Anomaly Overview',
      description: 'Anomaly Overview'
    },
    {
      key: 'anomaly_time',
      name: 'Time',
      description: 'Timestamp when the anomaly was detected.'
    },
    {
      key: 'anomaly_id',
      name: 'Anomaly ID',
      description: 'Unique identifier for this anomaly event.'
    },
    {
      key: 'anomaly_name',
      name: 'Name',
      description: 'Title of the detected anomaly.'
    },
    {
      key: 'anomaly_product_name',
      name: 'Product',
      description: 'Security product that raised this anomaly.'
    },
    {
      key: 'anomaly_severity_level',
      name: 'Severity',
      description: 'Severity level as assessed by the detection engine (critical / high / medium / low / informational).'
    },
    {
      key: 'anomaly_analysis_status',
      name: 'Status',
      description: 'Current analysis status: open = under investigation, closed = resolved.'
    },
    {
      key: 'anomaly_overview',
      name: 'Anomaly Overview',
      description: 'Anomaly Overview'
    },
    {
      key: 'open_relevant_anomaly_details',
      name: 'Relevant Anomaly Details (Open)',
      description: 'Relevant Anomaly Details (Open)'
    },
    {
      key: 'open_contextual_anomaly_details',
      name: 'Contextual Anomaly Details (Open)',
      description: 'Contextual Anomaly Details (Open)'
    },
    {
      key: 'closed_relevant_anomaly_details',
      name: 'Relevant Anomaly Details (Closed)',
      description: 'Relevant Anomaly Details (Closed)'
    },
    {
      key: 'closed_contextual_anomaly_details',
      name: 'Contextual Anomaly Details (Closed)',
      description: 'Contextual Anomaly Details (Closed)'
    },
    {
      key: 'related_entities_to_correlated_anomalies_details',
      name: 'Related Entities',
      description: 'Related Entities'
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
