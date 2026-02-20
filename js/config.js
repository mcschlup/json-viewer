// js/config.js
// Configuration for the JSON Viewer application

const CONFIG = {
  // URL parameter name containing the JSON data
  urlParam: 'data',

  // Highlight rules based on field KEY name patterns (checked in order, first match wins)
  keyHighlightRules: [
    {
      test: (key) => /id$/i.test(key),
      cssClass: 'hl-id',
      label: 'ID',
      color: '#f59e0b'
    },
    {
      test: (key) => /name$/i.test(key),
      cssClass: 'hl-name',
      label: 'Name',
      color: '#3b82f6'
    },
    {
      test: (key) => /time$|date$|timestamp$/i.test(key),
      cssClass: 'hl-time',
      label: 'Time',
      color: '#10b981'
    },
    {
      test: (key) => /info$|description$|desc$/i.test(key),
      cssClass: 'hl-info',
      label: 'Info',
      color: '#8b5cf6'
    }
  ],

  // Highlight rules based on field VALUE patterns (applied when no key rule matches)
  valueHighlightRules: [
    {
      test: (value) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(String(value)),
      cssClass: 'hl-time',
      label: 'Timestamp',
      color: '#10b981'
    },
    {
      test: (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value)),
      cssClass: 'hl-id',
      label: 'UUID',
      color: '#f59e0b'
    }
  ]
};
