import StudentListItem from '../src/components/StudentListItem.vue';
import StudentDetail from '../src/components/StudentDetail.vue';

import ModuleListItem from '../src/components/ModuleListItem.vue';
import ModuleDetail from '../src/components/ModuleDetail.vue';

import GraduateListItem from '../src/components/GraduateListItem.vue';
import GraduateDetail from '../src/components/GraduateDetail.vue';

import { markRaw } from 'vue';
import { mapStudents, mapGraduates, mapModules } from './DataMappers';

export enum PanelType {
  STUDENTS = 'students',
  GRADUATES = 'graduates',
  MODULES = 'modules',
  COMPLETED_MODULES = 'completedModules'
}

export type Panel = {
  detailComponent: any,
  listItemComponent: any,
  title: string,
  color: string,
  icon: string,
  sheetRange: string,
  mapData: (sheetData: any[][]) => Object[],
  type: PanelType
};

export function switchPanel(panel: PanelType): Panel {
  switch (panel) {
    case PanelType.GRADUATES:
      return {
        detailComponent: markRaw(GraduateDetail),
        listItemComponent: markRaw(GraduateListItem),
        title: 'Graduates',
        color: 'purple',
        icon: 'mdi-account-school',
        sheetRange: 'Graduates',
        mapData: mapGraduates,
        type: PanelType.GRADUATES
      };
    case PanelType.STUDENTS:
      return {
        detailComponent: markRaw(StudentDetail),
        listItemComponent: markRaw(StudentListItem),
        title: 'Students',
        color: 'blue',
        icon: 'mdi-account-group',
        sheetRange: 'Students',
        mapData: mapStudents,
        type: PanelType.STUDENTS
      };
    case PanelType.MODULES:
      return {
        detailComponent: markRaw(ModuleDetail),
        listItemComponent: markRaw(ModuleListItem),
        title: 'Modules',
        color: 'orange',
        icon: 'mdi-book-open-variant',
        sheetRange: 'Modules',
        mapData: mapModules,
        type: PanelType.MODULES
      };
    case PanelType.COMPLETED_MODULES:
      return {
        detailComponent: markRaw(ModuleDetail),
        listItemComponent: markRaw(ModuleListItem),
        title: 'Completed Modules',
        color: 'red',
        icon: 'mdi-book',
        sheetRange: 'Modules',
        mapData: mapModules,
        type: PanelType.COMPLETED_MODULES
      };
    default:
      throw new Error('switchPanel: Invalid panel type');
  }
}