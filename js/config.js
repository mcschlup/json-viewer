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
      description: 'Unique identifier for this anomaly event (x_detection_id attribute in the threat_hunting index).'
    },
    {
      key: 'anomaly_name',
      name: 'Anomaly Name',
      description: 'Title of the detected anomaly (search_name attribute in the threat_hunting index).'
    },
    {
      key: 'anomaly_product_name',
      name: 'Detection Product Name',
      description: 'Security product that raised this anomaly.'
    },
    {
      key: 'anomaly_severity_level',
      name: 'Anomaly Severity',
      description: 'Severity level of the anomaly as assessed by the detection engine (used to define the base severity score).'
    },
    {
      key: 'anomaly_analysis_status',
      name: 'Analysis Status',
      description: 'Current analysis status (open or closed). The status defines, if an anomaly is still taken into account for the risk score calculation of the risk notable.'
    },
    {
      key: 'identity_user',
      name: 'User Details',
      description: 'User Details'
    },
    {
      key: 'identity_app_registration',
      name: 'App Registration Details',
      description: 'App Registration Details'
    },
    {
      key: 'asset_host',
      name: 'Host Details',
      description: 'Host Details'
    },
    {
      key: 'asset_host_details',
      name: 'Host Details',
      description: 'Host Details'
    },
    {
      key: 'host_id',
      name: 'Host ID',
      description: 'Host ID'
    },
    {
      key: 'host_name',
      name: 'Host Name',
      description: 'Host Name'
    },
    {
      key: 'host_owner_id',
      name: 'User ID of Host Owner',
      description: 'User ID of Host Owner'
    },
    {
      key: 'host_owner_name',
      name: 'Name of Host Owner',
      description: 'Name of Host Owner'
    },
    {
      key: 'host_status',
      name: 'Host Status in Defender',
      description: 'Host Name'
    },
    {
      key: 'host_application_names_associated_with_asset_list',
      name: 'List of Applications',
      description: 'List of Applications'
    },
    {
      key: 'host_highest_application_name',
      name: 'Application Name',
      description: 'Application assigned to this host with the highest assigned CIA rating / criticality'
    },
    {
      key: 'host_highest_application_confidentiality',
      name: 'Application Confidentiality',
      description: 'Confidentiality of the application assigned to this host with the highest assigned CIA rating / criticality'
    },
    {
      key: 'host_highest_application_integrity',
      name: 'Application Integrity',
      description: 'Integrity of the application assigned to this host with the highest assigned CIA rating / criticality'
    },
    {
      key: 'host_highest_application_availability',
      name: 'Application Availability',
      description: 'Availability of the application assigned to this host with the highest assigned CIA rating / criticality'
    },
    {
      key: 'host_highest_business_criticality',
      name: 'Application Business Criticality',
      description: 'Business Criticality of the application assigned to this host with the highest assigned CIA rating / criticality'
    },
    {
      key: 'host_additional_info',
      name: 'Additional Details',
      description: 'If available, shows more host details (e.g. for known IPs/IP ranges, known proxy or firewall devices, etc.)' 
    },
    {
      key: 'risk_vulnerability_factor_details',
      name: 'Host Vulnerability Details',
      description: 'Host Vulnerability Details'
    },
    {
      key: 'asset_software_vulnerability',
      name: 'Software Vulnerabilities',
      description: 'Information related to vulnerabilities concerning the current prioritized entity (if it is an asset / host)'
    },
    {
      key: 'number_of_critical_vulnerabilities',
      name: '# of Critical Vulnerabilities',
      description: 'Number of Critical Vulnerabilities assigned to the current prioritized entity'
    },
    {
      key: 'total_number_of_exploitable_vulnerabilities',
      name: '# of Exploitable Vulnerabilities',
      description: 'Number of Exploitable Vulnerabilities assigned to the current prioritized entity'
    },
    {
      key: 'total_number_of_high_epss_vulnerabilities',
      name: '# of Vulnerabilities with high EPSS',
      description: 'Number of Vulnerabilities with high EPSS score assigned to the current prioritized entity'
    },
    {
      key: 'asset_critical_vulnerabilities_list',
      name: 'List of Critical Vulnerabilities',
      description: 'List of Critical Vulnerabilities assigned to the current prioritized entity'
    },
    {
      key: 'asset_exploitable_vulnerabilities_list',
      name: 'List of Exploitable Vulnerabilities',
      description: 'List of Exploitable Vulnerabilities assigned to the current prioritized entity'
    },
    {
      key: 'asset_high_epss_vulnerabilities_list',
      name: 'List of Vulnerabilities with high EPSS',
      description: 'List of Vulnerabilities with high EPSS score assigned to the current prioritized entity'
    },
    {
      key: 'asset_insecure_configuration',
      name: 'Insecure Configuration',
      description: 'Information related to insecure configurations concerning the current prioritized entity (if it is an asset / host)'
    },
    {
      key: 'total_number_of_insecure_configurations',
      name: '# of Insecure Configurations',
      description: 'Number of Insecure Configurations assigned to the current prioritized entity'
    },
    {
      key: 'asset_internet_exposure',
      name: 'Internet Exposure',
      description: 'Information related to Internet exposure concerning the current prioritized entity (if it is an asset / host)'
    },
    {
      key: 'asset_is_internet_exposed',
      name: 'Asset is Internet exposed',
      description: 'Set to "yes" if asset is known to be potentially exposed to the internet (e.g. has public IP, is in a VPC with Internet gateway, etc.)'
    },
    {
      key: 'asset_cloud_account',
      name: 'Cloud Account Details',
      description: 'Cloud Account Details'
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
