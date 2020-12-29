interface InterfaceItemCreator {
  id: number;
  username: string;
  portrait: string;
  realname: string;
  realnamePinyin: string;
}
interface InterfaceItemGroup {
  id: number;
  name: string;
  namePinyin: string;
  description: string;
  rpcPom: null;
  rpcKey: null;
  respoId: number;
  projectId: number;
  creatorId: number;
}

export interface SubInterfaceItemOrigin {
  id: number;
  type: number;
  name: string;
  isArray: number;
  valExpression: string;
  genExpression: string;
  description: string;
  defaultValue: string;
  parentId: number;
  parentType: number;
  progroupId: number;
  createTime: number;
  required: number;
  position: number;
  datatypeId?: number;
  datatypeName?: string;
  ignored?: number;
  typeName: string;
}
export interface SubInterfaceItem extends SubInterfaceItemOrigin {
  childComposedInterface: DataTypeItem;
}

// /api/datatypes/?pid={pageId}
export interface DataTypeItem {
  creator: InterfaceItemCreator;
  group: InterfaceItemGroup;
  id: number;
  tag: string;
  tagPinyin: string;
  type: number;
  name: string;
  format: number;
  description: string;
  groupId: number;
  projectId: number;
  progroupId: number;
  creatorId: number;
  createTime: number;
  watchList: [];
  params: SubInterfaceItem[]; // 自定义
  isWatched: number;
}

// /api/interfaces/{interfaceId}
export interface InterfaceItem {
  respo: {};
  creator: InterfaceItemCreator;
  group: InterfaceItemGroup;
  status: {};
  id: number;
  tag: string;
  tagPinyin: string;
  name: string;
  namePinyin: string;
  statusId: number;
  path: string;
  type: number;
  method: string;
  isRest: number;
  className: string;
  description: string;
  paramsOrder: string;
  respoId: number;
  groupId: number;
  projectId: number;
  progroupId: number;
  creatorId: number;
  createTime: number;
  reqFormat: number;
  resFormat: number;
  beforeScript: string;
  afterScript: string;
  blbScript: string;
  blaScript: string;
  connectId: number;
  connectType: number;
  mockDelay: number;
  schema: string;
  params: {
    inputs: SubInterfaceItem[];
    outputs: SubInterfaceItem[];
  };
  clients: [];
  watchList: [];
  isWatched: number;
}

/*
// progroups
export interface ProGroups {
  creator: InterfaceItemCreator;
  pguser: {};
  id: number;
  type: number;
  logo: string;
  name: string;
  namePinyin: string;
  description: string;
  creatorId: number;
  createTime: number;
  projectOrder: number;
  projectOrderList: string;
  projectTopList: string;
  verification: number;
  verificationRole: number;
  toolKey: string;
  toolSpecWeb: number;
  toolSpecAos: number;
  toolSpecIos: number;
  toolSpecTest: number;
  isLock: number;
  apiAudit: number;
  apiUpdateControl: number;
  showPublicList: number;
  useWordStock: number;
  projects: ProjectParams[];
  httpSpec: {};
  observers: [];
  developers: [];
  testers: [];
  auditors: [];
  admins: [];
}

export interface ProjectParams {
  creator: InterfaceItemCreator;
  id: number;
  type: number;
  logo: string;
  name: string,
  namePinyin: string,
  lob: string;
  description: string;
  qbsId: number;
  progroupId: number;
  creatorId: number;
  createTime: number;
  toolKey: string,
  toolSpecWeb: number;
  toolSpecAos: number;
  toolSpecIos: number;
  toolSpecTest: number;
  hostId: number;
  authType: number;
  resParamRequired: number;
  useWordStock: number;
}
*/

interface SearchInterfaceItem {
  id: number;
  resType: number;
  project: {
    id: number;
    type: number;
    logo: string;
    name: string;
    namePinyin: string;
    lob: string;
    description: string;
    qbsId: number;
    progroupId: number;
    creatorId: number;
    createTime: number;
  };
  resData: {
    id: number;
    tag: string;
    tagPinyin: string;
    name: string;
    namePinyin: string;
    statusId: number;
    path: string;
    type: number;
    method: string;
    isRest: number;
    className: string;
    description: string;
    paramsOrder: string;
    respoId: number;
    groupId: number;
    projectId: number;
    progroupId: number;
    creatorId: number;
    createTime: number;
  };
  viewCount: number;
  createTime: number;
}

interface SearchDataTypeItem {
  creator: InterfaceItemCreator;
  group: InterfaceItemGroup;
  createTime: number;
  description: string;
  format: number;
  id: number;
  name: string;
  project: {
    id: number;
    name: string;
    namePinyin: string;
  };
  tag: string;
  tagPinyin: string;
}
