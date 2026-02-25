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
    },
    {
      testKey:   (key)   => key === 'identity_is_risky_person',
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
    //-------------------------------------------------------------------------------------------------------
    // Generic section
    //-------------------------------------------------------------------------------------------------------
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
    //-------------------------------------------------------------------------------------------------------
    // Anomaly Overview section
    //-------------------------------------------------------------------------------------------------------
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
    //-------------------------------------------------------------------------------------------------------
    // User Details section
    //-------------------------------------------------------------------------------------------------------
    {
      key: 'identity_user',
      name: 'User Details',
      description: 'User Details'
    },
    {
      key: 'identity_user_details',
      name: 'User Details',
      description: 'User Details'
    },
    {
      key: 'user_id',
      name: 'User ID',
      description: 'User ID of the current prioritized entity'
    },
    {
      key: 'user_name',
      name: 'User Name',
      description: 'Full name of the current prioritized entity'
    },
    {
      key: 'user_is_risky_person',
      name: 'User is Risky Person',
      description: 'Current prioritized entity is rated as risky person. If applicable, set to any combination of "Executive", "Domain Admin" and/or "Leaving Employee"'
    },
    {
      key: 'user_manager_id',
      name: 'Manager User ID',
      description: 'User ID of the user\'s manager'
    },
    {
      key: 'user_manager_name',
      name: 'Manager Name',
      description: 'Full name of the user\'s manager'
    },
    {
      key: 'user_team_name',
      name: 'Team Name',
      description: 'Name of the team the user is working with'
    },
    {
      key: 'user_location',
      name: 'Location',
      description: 'Place of work of the user (city, office building)'
    },
    {
      key: 'user_office',
      name: 'Office',
      description: 'Office details for the current user'
    },
    {
      key: 'user_phone_number',
      name: 'Phone Number',
      description: 'The user\'s phone number'
    },
    {
      key: 'user_mobile_number',
      name: 'Mobile Phone Number',
      description: 'The user\'s mobile phone number'
    },
    {
      key: 'user_email_address',
      name: 'E-Mail Address',
      description: 'The user\'s e-mail address'
    },
    {
      key: 'user_calendar_drill_down',
      name: 'Calendar',
      description: 'Drill down link to the user\'s calendar in peoplesearch'
    },
    {
      key: 'user_last_password_reset_time',
      name: 'Password Reset Time',
      description: 'Time when the user\'s password has last been reset (source of this data is updated only once per hour)'
    },
    {
      key: 'user_associated_devices',
      name: 'Associated Devices',
      description: 'List of Devices associated with the user'
    },
    {
      key: 'user_last_loggedon_devices',
      name: 'Last Logged-on Devices',
      description: 'List of Devices that the user has authenticated against during the last 14 days'
    },
    {
      key: 'user_email_external',
      name: 'External E-Mail Address',
      description: 'External e-mail address (company e-mail address of an external employee)'
    },
    {
      key: 'user_employee_type',
      name: 'Employee Type',
      description: 'Meta Directory flag representing the type of the user (e.g. Internal, External, Technical Account, Test Account, etc.)'
    },
    {
      key: 'user_market_unit',
      name: 'Market Unit',
      description: 'Market unit the user is assigned to / is working in'
    },
    // risk_vulnerability_factor_details already defined in host details section
    {
      key: 'identity_authentication_against_vulnerable_or_insecure_asset_last_200_days',
      name: 'Authentication against risky assets',
      description: 'Current prioritized entity has authenticated against an asset that is known to have software vulnerabilities and/or insecure configurations'
    },
    {
      key: 'identity_authentication_against_vulnerable_asset_last_200_days_asset_list',
      name: 'List of risky assets',
      description: 'List of assets with known software vulnerabilities and/or insecure configurations that the current prioritized entity has authenticated against during the last 200 days'
    },
    {
      key: 'risk_impact_factor_details',
      name: 'Risk Impact',
      description: 'Risk Impact'
    },
    {
      key: 'identity_is_risky_person',
      name: 'Risky Person',
      description: 'Current prioritized entity is rated as risky person. If applicable, set to any combination of "Executive", "Domain Admin" and/or "Leaving Employee"'
    },
    {
      key: 'identity_authentication_against_critical_application_last_200_days_application_list',
      name: 'Authentication against Critical Application',
      description: 'List of applications rated critical running on assets that the current prioritized entity has authenticated against during the last 200 days'
    },
    {
      key: 'identity_authentication_against_cia_application_last_200_days_application_list',
      name: 'Authentication against High CIA Score Application',
      description: 'List of applications with high CIA score running on assets that the current prioritized entity has authenticated against during the last 200 days'
    },
    //-------------------------------------------------------------------------------------------------------
    // App Reg Details section
    //-------------------------------------------------------------------------------------------------------
    {
      key: 'identity_app_registration',
      name: 'App Registration Details',
      description: 'App Registration Details'
    },
    //-------------------------------------------------------------------------------------------------------
    // Host Details section
    //-------------------------------------------------------------------------------------------------------
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
      name: 'Vulnerability Details',
      description: 'Vulnerability Details'
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
    // risk_impact_factor_details already defined in host details section
    {
      key: 'asset_cloud_accountxxxxx',
      name: 'Cloud Account Details',
      description: 'Cloud Account Details'
    },
    //-------------------------------------------------------------------------------------------------------
    // Cloud Account Details section
    //-------------------------------------------------------------------------------------------------------
    {
      key: 'asset_cloud_account',
      name: 'Cloud Account Details',
      description: 'Cloud Account Details'
    },
    //-------------------------------------------------------------------------------------------------------
    // Anomaly Details sections
    //-------------------------------------------------------------------------------------------------------
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
      key: 'anomaly_drill_down',
      name: 'Product/Details Drill Down',
      description: 'Link to the detecting product showing more details related to the anomaly. Shows raw events in Splunk for custom use cases.'
    },
    {
      key: 'anomaly_response_instruction_drill_down',
      name: 'Response Instructions',
      description: 'Link to response instructions for that specific anomaly.'
    },
    {
      key: 'anomaly_market_unit',
      name: 'Market Unit',
      description: 'Market Unit(s) somehow involved in this anomaly.'
    },
    {
      key: 'anomaly_source_identity',
      name: 'Source Identity(s)',
      description: 'All identities identified as source (actor) in this anomaly.'
    },
    {
      key: 'anomaly_source_asset',
      name: 'Source Assets(s)',
      description: 'All assets identified as source (actor) in this anomaly.'
    },
    {
      key: 'anomaly_destination_identity',
      name: 'Destination Identity(s)',
      description: 'All identities identified as destination (target) in this anomaly.'
    },
    {
      key: 'anomaly_destination_asset',
      name: 'Destination Asset(s)',
      description: 'All assets identified as destination (target) in this anomaly.'
    },
    {
      key: 'anomaly_additional_info',
      name: 'Additional Information',
      description: 'Additional information related to this anomaly.'
    },
    //-------------------------------------------------------------------------------------------------------
    // Related Entities section
    //-------------------------------------------------------------------------------------------------------
    {
      key: 'related_entities_to_correlated_anomalies_details',
      name: 'Related Entities',
      description: 'Related Entities'
    },
    {
      key: 'related_entity',
      name: 'Entity Name',
      description: 'Entity Name'
    },
    {
      key: 'related_entity_type',
      name: 'Entity Type',
      description: 'Entity Type'
    },
    {
      key: 'related_entity_score',
      name: 'Entity Risk Score',
      description: 'Entity Risk Score'
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
