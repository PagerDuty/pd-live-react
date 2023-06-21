import '@testing-library/jest-dom';

import {
  mockStore, componentWrapper,
} from 'mocks/store.test';

import {
  DndProvider,
} from 'react-dnd';
import {
  HTML5Backend,
} from 'react-dnd-html5-backend';

import ColumnsModalComponent from './ColumnsModalComponent';

describe('ColumnsModalComponent', () => {
  let baseStore;
  let store;
  let DndColumnsModalComponent;

  beforeEach(() => {
    baseStore = {
      settings: {
        displayColumnsModal: true,
        alertCustomDetailFields: [
          {
            label: 'CustomField:details.to.some.path',
            value: 'CustomField:details.to.some.path',
            columnType: 'alert',
            Header: 'CustomField',
            accessorPath: 'details.to.some.path',
            aggregator: null,
          },
          {
            label: 'AnotherCustomField:details.to.some.other.path',
            value: 'AnotherCustomField:details.to.some.other.path',
            columnType: 'alert',
            Header: 'AnotherCustomField',
            accessorPath: 'details.to.some.other.path',
            aggregator: null,
          },
        ],
      },
      incidentTable: {
        incidentTableColumns: [
          { Header: '#', accessorPath: null, columnType: 'incident' },
          { Header: 'Status', accessorPath: null, columnType: 'incident' },
          { Header: 'CustomField', accessorPath: 'details.to.some.path', columnType: 'incident' },
        ],
      },
    };
    DndColumnsModalComponent = () => (
      <DndProvider backend={HTML5Backend}>
        <ColumnsModalComponent />
      </DndProvider>
    );
  });

  it('should render modal', () => {
    store = mockStore(baseStore);

    const wrapper = componentWrapper(store, DndColumnsModalComponent);
    expect(wrapper.find('.chakra-modal__header').contains('Incident Table')).toBeTruthy();
  });

  // FIXME: Column drag & drop

  it('should display incident table settings', () => {
    store = mockStore(baseStore);
    const wrapper = componentWrapper(store, DndColumnsModalComponent);

    expect(wrapper.find('h2').contains('Available')).toBeTruthy();
    expect(wrapper.find('#incident-column-select')).toBeTruthy();
    expect(wrapper.find('h2').contains('Custom')).toBeTruthy();
    expect(wrapper.find('#alert-column-definition-select')).toBeTruthy();
    expect(wrapper.find('#save-columns-button').contains('OK')).toBeTruthy();
  });

  it('should render an enabled custom column option with unique header name', () => {
    store = mockStore(baseStore);
    const wrapper = componentWrapper(store, DndColumnsModalComponent);
    const customColumns = wrapper.find('div#custom-columns-card-body');
    const selectedColumns = wrapper.find('div#selected-columns-card-body');
    const availableColumns = wrapper.find('div#available-columns-card-body');
    expect(customColumns.find('span[value="CustomField:details.to.some.path"]')).toBeTruthy();
    expect(selectedColumns.find('span[value="CustomField"]')).toBeTruthy();
    expect(availableColumns.find('span[value="CustomField"]')).toEqual({});
  });

  it('should render an available custom column option with unique header name', () => {
    store = mockStore(baseStore);
    const wrapper = componentWrapper(store, DndColumnsModalComponent);
    const customColumns = wrapper.find('div#custom-columns-card-body');
    const selectedColumns = wrapper.find('div#selected-columns-card-body');
    const availableColumns = wrapper.find('div#available-columns-card-body');
    expect(customColumns.find('span[value="AnotherCustomField:details.to.some.other.path"]')).toBeTruthy();
    expect(selectedColumns.find('span[value="AnotherCustomField"]')).toEqual({});
    expect(availableColumns.find('span[value="AnotherCustomField"]')).toBeTruthy();
  });

  // it('should render a disabled custom column option which has a duplicate header/name', () => {
  //   store = mockStore(baseStore);
  //   const wrapper = componentWrapper(store, ColumnsModalComponent);
  //   const tabSelector = 'a[data-rb-event-key="incident-table"]';
  //   const tabElement = wrapper.find(tabSelector);
  //   tabElement.simulate('click');
  //   expect(wrapper.find('[value="Summary:details.to.some.path"]').prop('disabled')).toEqual(true);
  // });
});
