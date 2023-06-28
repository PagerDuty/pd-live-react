// Configuration for Fuse.js (Fuzzy Search)

import {
  defaultIncidentColumns, defaultAlertsColumns,
} from './column-generator';

// Docs: https://fusejs.io/api/options.html
const fuseOptions = {
  threshold: 0.2,
  ignoreLocation: true,
  useExtendedSearch: true,
  keys: defaultIncidentColumns()
    .map((col) => {
      // Handle specific cases for columns with functional accessor
      let key = '';
      switch (col.Header) {
        case 'Assignees':
          key = 'assignments.summary';
          break;
        case 'Teams':
          key = 'teams.summary';
          break;
        case 'Acknowledgments':
          key = 'acknowledgements.summary';
          break;
        case 'Priority':
          key = 'priority.summary';
          break;
        case 'Latest Note':
          key = 'notes.content';
          break;
        default:
          key = col.accessor;
      }
      return key;
    })
    .concat(
      defaultAlertsColumns().map((col) => {
        let key = '';
        switch (col.Header) {
          case 'Severity':
            key = 'alerts.body.cef_details.severity';
            break;
          case 'Component':
            key = 'alerts.body.cef_details.source_component';
            break;
          case 'Source':
            key = 'alerts.body.cef_details.source_origin';
            break;
          case 'Class':
            key = 'alerts.body.cef_details.event_class';
            break;
          case 'Group':
            key = 'alerts.body.cef_details.service_group';
            break;
          default:
            key = col.accessor;
        }
        return key;
      }),
    ),
};

export default fuseOptions;
