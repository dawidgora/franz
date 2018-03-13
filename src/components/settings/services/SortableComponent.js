import React, { Component } from 'react';
import { sortableContainer, sortableElement, arrayMove, DragLayer } from 'react-sortable-multiple-hoc';

import ServiceGroup from '../../../models/ServiceGroup';

import ServiceItem from './ServiceItem';

const dragLayer = new DragLayer();

const SortableService = sortableElement(({item}) => {
  // console.log(item.id)
  return (
    // <ServiceItem
    //   key={item.id}
    //   service={item}
    //   // toggleAction={() => toggleService({ serviceId: service.id })}
    //   // goToServiceForm={() => goTo(`/settings/services/edit/${service.id}`)}
    // />
    <div key={item.id}>{item.name}</div>
  );
});

const SortableListServices = sortableContainer(({ items }) =>
  <div>
    {items.map((service, index) => (
      <SortableService
        key={service.id}
        index={index}
        item={service}
      />
    ))}
  </div>,
);

const SortableGroup = sortableElement(props => (props.item.group || null) &&
  <div style={{ border: '1px solid grey', marginBottom: '10px' }}>
    <div>
      <span style={{ marginLeft: '50px', fontWeight: 'bold' }}>{props.item.group.name}</span>
    </div>
    <SortableListServices
      {...props} // onMultipleSortEnd
      items={props.item.services}
      dragLayer={dragLayer}
      distance={3}
      helperClass={'selected__service'}
      isMultiple
      helperCollision={{ top: 0, bottom: 0 }}
    />
  </div>,
);

const SortableListGroups = sortableContainer(({ items, onSortItemsEnd }) => {
  return (
    <div>
      {items.map((group, index) => (group &&
        <SortableGroup
          key={'group-' + index}
          index={index}
          item={group}
          id={index}
          onMultipleSortEnd={onSortItemsEnd}
          // onSortEnd={onSortEnd}
        />
      ))}
    </div>);
});

export default class SortableComponent extends Component {
  onSortEnd = ({ oldIndex, newIndex }) => {
    const structure = arrayMove(this.props.groups, oldIndex, newIndex);
    console.log(structure);
    this.props.reorder({ structure });
  }

  onSortItemsEnd = ({ newListIndex, newIndex, items }) => {
    console.log(newListIndex, newIndex, items)
    
    const structure = this.props.groups; //Object.assign([], toJS(this.props.groups));

    items.forEach((item) => {
      const oldListIndex = item.listId;
      const oldIndex = item.id;

      const source = structure[oldListIndex];
      const destination = structure[newListIndex];

      const service = source.services[oldIndex];
      source.services.splice(oldIndex, 1); // remove service from source group
      if (source.type === 'root') {
        structure.splice(oldListIndex, 1);
        // newListIndex = oldListIndex < newListIndex ? newListIndex - 1 : newListIndex;
      }

      switch (destination.type) {
        case 'root':
          service.groupId = '';
          structure.splice(newIndex ? newListIndex + 1 : newListIndex, 0, { // WRONG??
            type: 'root',
            group: new ServiceGroup({ name: 'Uncat' }),
            services: [service],
          });
          break;
        case 'group':
          service.groupId = destination.group.id;
          destination.services.splice(newIndex, 0, service);
          break;
        default:
      }
    });

    // reorder data model
    this.props.reorder({ structure });
  }

  render() {
    console.log('RERENDER', this.props.groups)

    return (
      <div>
        <SortableListGroups
          items={this.props.groups}
          onSortEnd={this.onSortEnd}
          onSortItemsEnd={this.onSortItemsEnd}
          helperClass={'selected__group'}
        />
      </div>
    );
  }
}
