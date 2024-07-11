/* eslint-disable react/jsx-filename-extension */
import '@testing-library/jest-dom';
import React from 'react';
import {
  DndProvider,
} from 'react-dnd';
import {
  HTML5Backend,
} from 'react-dnd-html5-backend';
import {
  componentWrapper, screen,
} from 'src/custom-testing-lib';
import {
  mockStore,
} from 'mocks/store.test';

import {
  within,
} from 'custom-testing-lib';
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
          {
            label: "Fav Flavour:details.['favorite ice cream flavor']",
            value: "Fav Flavour:details.['favorite ice cream flavor']",
            columnType: 'alert',
            Header: 'Fav Flavour',
            accessorPath: "details.['favorite ice cream flavor']",
            aggregator: null,
          },
        ],
        computedFields: [
          {
            label: 'regex-single in incident body:first_trigger_log_entry.channel.details:(.*.example.com)',
            value: 'regex-single in incident body:first_trigger_log_entry.channel.details:(.*.example.com)',
            columnType: 'computed',
            Header: 'regex-single in incident body',
            accessorPath: 'first_trigger_log_entry.channel.details',
            expressionType: 'regex-single',
            expression: '(.*.example.com)',
            aggregator: null,
          },
        ],
      },
      incidentTable: {
        incidentTableColumns: [
          { Header: '#', accessorPath: null, columnType: 'incident' },
          { Header: 'Status', accessorPath: null, columnType: 'incident' },
          { Header: 'CustomField', accessorPath: 'details.to.some.path', columnType: 'alert' },
          {
            Header: 'Fav Flavour',
            accessorPath: "details.['favorite ice cream flavor']",
            columnType: 'alert',
          },
        ],
      },
    };
    DndColumnsModalComponent = () => (
      <DndProvider backend={HTML5Backend}>
        <ColumnsModalComponent />
      </DndProvider>
    );
    store = mockStore(baseStore);
    componentWrapper(store, DndColumnsModalComponent);
  });

  it('should render modal', () => {
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveTextContent('Incident Table');
    expect(screen.getByRole('heading', { name: 'Selected' })).toBeInTheDocument();
    // 2 standard fields, 3 custom fields, 2 added custom alert fields, 1 added computed
    expect(screen.getAllByLabelText('Remove column')).toHaveLength(8);
    expect(screen.getByRole('heading', { name: 'Available' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Custom' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
  });

  it('should render an enabled custom column option with unique header name', () => {
    // Find the Custom header, and find the CustomField DnD box near it
    const customColumns = screen.getByText('Custom').parentElement.parentElement;
    const customColumn = within(customColumns).getByText('CustomField:details.to.some.path');
    expect(customColumn).toBeInTheDocument();
    expect(within(customColumn).getByLabelText('Remove column')).toBeInTheDocument();

    // Find the Selected header, and find the Selected DnD box near it
    const selectedColumns = screen.getByText('Selected').parentElement.parentElement;
    const selectedColumn = within(selectedColumns).getByText('CustomField');
    expect(selectedColumn).toBeInTheDocument();
    expect(within(selectedColumn).getByLabelText('Remove column')).toBeInTheDocument();
  });

  it('should render an available custom alert column option with unique header name', () => {
    const customColumns = screen.getByText('Custom').parentElement.parentElement;
    const customColumn = within(customColumns).getByText(
      'AnotherCustomField:details.to.some.other.path',
    );
    expect(customColumn).toBeInTheDocument();
    expect(within(customColumn).getByLabelText('Remove column')).toBeInTheDocument();

    const availableColumns = screen.getByText('Available').parentElement.parentElement;
    const availableColumn = within(availableColumns).getByText('AnotherCustomField');
    expect(availableColumn).toBeInTheDocument();
    expect(within(availableColumn).getByLabelText('Add column')).toBeInTheDocument();
  });

  it('should render an enabled custom column option with JSON path containing spaces', () => {
    const customColumns = screen.getByText('Custom').parentElement.parentElement;
    const customColumn = within(customColumns).getByText(
      "Fav Flavour:details.['favorite ice cream flavor']",
    );
    expect(customColumn).toBeInTheDocument();
    expect(within(customColumn).getByLabelText('Remove column')).toBeInTheDocument();

    const selectedColumns = screen.getByText('Selected').parentElement.parentElement;
    const selectedColumn = within(selectedColumns).getByText('Fav Flavour');
    expect(selectedColumn).toBeInTheDocument();
    expect(within(selectedColumn).getByLabelText('Remove column')).toBeInTheDocument();
  });

  // it('should render a disabled custom column option which has a duplicate header/name', () => {
  //   store = mockStore(baseStore);
  //   const wrapper = componentWrapper(store, ColumnsModalComponent);
  //   const tabSelector = 'a[data-rb-event-key="incident-table"]';
  //   const tabElement = wrapper.find(tabSelector);
  //   tabElement.simulate('click');
  //   expect(wrapper.find('[value="Summary:details.to.some.path"]').prop('disabled')).toEqual(true);
  // });

  it('should render an available computed option with unique header name', () => {
    const customColumns = screen.getByText('Custom').parentElement.parentElement;
    const customColumn = within(customColumns).getByText(
      'regex-single in incident body:first_trigger_log_entry.channel.details:(.*.example.com)',
    );
    expect(customColumn).toBeInTheDocument();
    expect(within(customColumn).getByLabelText('Remove column')).toBeInTheDocument();

    const availableColumns = screen.getByText('Available').parentElement.parentElement;
    const availableColumn = within(availableColumns).getByText('regex-single in incident body');
    expect(availableColumn).toBeInTheDocument();
    expect(within(availableColumn).getByLabelText('Add column')).toBeInTheDocument();
  });
});
