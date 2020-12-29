// nei 响应信息 + 请求信息
// https://nei.hz.netease.com/api/interfaces/18540

// nei all types
// https://nei.hz.netease.com/api/datatypes/?pid=11882

// nei mock
// https://nei.hz.netease.com/api/mockstore/?interfaceId=18160

import qs from "query-string";
import {
  DataTypeItem,
  InterfaceItem,
  SearchInterfaceItem,
  SearchDataTypeItem,
  // ProGroups,
  // ProjectParams,
} from "../types";

/*
import {
  allTypes,
  allPublicTypes,
  interfaceData,
  groups as groupsData,
} from "./_mock";
const fetch = (url) =>
  new Promise((r) => {
    r({
      json: () => {
        if (url.includes("interfaces")) {
          return interfaceData;
        }
        if (url.includes("datatype")) {
          if (url.match(/\/\d+/)?.[0] === PUBLIC_PROJECT_ID) {
            // TODO: 公共资源库数据
            return allPublicTypes;
          }
          return allTypes;
        }
        if (url.includes("groups")) {
          return groupsData;
        }
      },
    });
  });
*/

// const define
export const STORAGE_PREFIX = "__NEI_TEMPLATE_PLUGIN__";
export const PUBLIC_PROJECT_ID = 11857; // 公共资源库

// storage key
export const getAllTypesStorageKey = (projectId: number): string =>
  `${STORAGE_PREFIX}-types-${projectId}`;
export const getInterfaceStorageKey = (interfaceId: number): string =>
  `${STORAGE_PREFIX}-interface-${interfaceId}`;
export const getDataTypeStorageKey = getAllTypesStorageKey;

// fetch url
const getInterfaceUrlByInterfaceId = (id) =>
  `https://nei.hz.netease.com/api/interfaces/${id}`;
const getAllTypesUrlByProjectId = (id) =>
  `https://nei.hz.netease.com/api/datatypes/?pid=${id}`;
// const getProGroupsByProGroupId = (id) =>
//   `https://nei.hz.netease.com/api/progroups/${id}`;
const getSearchUrlByKeyword = (keyword, type = "datatypes") =>
  `https://nei.hz.netease.com/api/${type}?search&v=${keyword}&offset=0&limit=999&total=true`;

/**
 * 搜索对应 interface/datatype
 * @param {number} projectId
 * @param {number} interfaceId
 * @param {string} interfaceName
 * @param {string} type
 */
const searchInterfaceByPath = async (
  projectId: number,
  interfaceId: number,
  interfaceName: string,
  type: "interfaces" | "datatypes" = "datatypes"
): Promise<SearchInterfaceItem | SearchDataTypeItem> => {
  const searchResultList = await fetch(
    getSearchUrlByKeyword(interfaceName, type)
  )
    .then(async (response) => {
      const res = await response.json();
      if (!res?.code || res?.code !== 200) {
        throw new Error(res.msg ?? "error");
      }
      return res?.result ?? [];
    })
    .catch((err) => {
      console.error(err);
      return Promise.reject(err);
    });
  const result = (() => {
    if (type === "interfaces") {
      return searchResultList.find(
        (item) =>
          item.resData.id === interfaceId &&
          item.resData.projectId === projectId &&
          item.resData.path.includes(interfaceName)
      );
    }
    if (type === "datatypes") {
      return searchResultList.find(
        (item) =>
          item.id === interfaceId &&
          // item.project.id === projectId &&
          item.name.includes(interfaceName)
      );
    }
  })();
  // 默认搜索 interface ， 如果 datatype 没搜过尝试搜索 datatype
  return result;
};

/**
 * 获取当前 project 下的所有类型数据 - 包括了 datatype 在内
 * @param {number} projectId
 */
export const getAllTypes = async (
  projectId: number
): Promise<DataTypeItem[]> => {
  if (projectId === undefined || projectId === null) {
    return Promise.reject(new TypeError("error projectId"));
  }

  const SESSION_STORAGE_KEY = getAllTypesStorageKey(projectId);
  const types: DataTypeItem[] | undefined = JSON.parse(
    sessionStorage.getItem(SESSION_STORAGE_KEY)
  );

  if (types) {
    return Promise.resolve(types);
  }

  const _types = await fetch(getAllTypesUrlByProjectId(projectId))
    .then(async (response: any) => {
      const res = await response.json();
      if (!res?.code || res?.code !== 200) {
        throw new Error(res.msg ?? "error");
      }
      return res?.result ?? [];
    })
    .catch((err) => {
      console.error(err);
      return Promise.reject(err);
    });
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(_types));

  return Promise.resolve(_types);
};

/**
 * 获取接口数据
 * @param {number} interfaceId
 */
export const getInterface = async (
  interfaceId: number
): Promise<InterfaceItem> => {
  if (interfaceId === undefined || interfaceId === null) {
    return Promise.reject(new TypeError("error interfaceId"));
  }

  const SESSION_STORAGE_KEY = getInterfaceStorageKey(interfaceId);
  const interfaces: InterfaceItem | undefined = JSON.parse(
    sessionStorage.getItem(SESSION_STORAGE_KEY)
  );

  if (interfaces) {
    return Promise.resolve(interfaces);
  }

  const _interfaces = await fetch(getInterfaceUrlByInterfaceId(interfaceId))
    .then(async (response: any) => {
      const res = await response.json();
      if (!res?.code || res?.code !== 200) {
        throw new Error(res.msg ?? "error");
      }
      return res?.result;
    })
    .catch((err) => {
      console.error(err);
      return Promise.reject(err);
    });
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(_interfaces));
  return Promise.resolve(_interfaces);
};

/**
 * 查询 datatype 数据
 * @param {number} projectId
 * @param {number} interfaceId
 * @param {string} interfaceName
 */
export const getDataType = async (
  projectId: number,
  interfaceId: number, // 备用，查不到时用于搜索
  interfaceName: string
): Promise<DataTypeItem> => {
  const SESSION_STORAGE_KEY = getDataTypeStorageKey(projectId);
  const types = JSON.parse(
    sessionStorage.getItem(SESSION_STORAGE_KEY)
  ) as DataTypeItem[];

  if (!types) {
    // 不存在的再去取
    return getAllTypes(projectId).then((types) => {
      return types.find((typeItem) => {
        return (
          typeItem.projectId === projectId && typeItem.name === interfaceName
        );
      });
    });
  }

  const targetTypeItem = types.find((typeItem) => {
    return typeItem.projectId === projectId && typeItem.name === interfaceName;
  });

  if (!targetTypeItem && projectId !== PUBLIC_PROJECT_ID) {
    // 指定 project 的 allTypes 中没找到， 去公共资源库找
    console.warn(
      `[1/4] ( id: ${projectId}, name: ${interfaceName} ) 指定 project 的 allTypes 中没找到对应数据，尝试去公共资源库找`
    );
    await getAllTypes(PUBLIC_PROJECT_ID);
    return getDataType(PUBLIC_PROJECT_ID, interfaceId, interfaceName);
  }
  if (!targetTypeItem && projectId === PUBLIC_PROJECT_ID) {
    // 公共资源库也没有的话直接搜索接口
    console.warn(
      `[2/4] ( id: ${projectId}, name: ${interfaceName} ) 公共资源库也没有，开始搜索查询 interface`
    );
    // 搜 datatype
    const searchDataTypeResult = (await searchInterfaceByPath(
      projectId,
      interfaceId,
      interfaceName,
      "datatypes"
    )) as SearchDataTypeItem;
    if (searchDataTypeResult) {
      console.warn(
        `[ok] ( id: ${projectId}, name: ${interfaceName} ) datatype 已找到 ${interfaceName}`
      );
      const nextProjectId = searchDataTypeResult.project.id;
      await getAllTypes(nextProjectId);
      return getDataType(nextProjectId, interfaceId, interfaceName);
    }
    console.warn(
      `[3/4] ( id: ${projectId}, name: ${interfaceName} ) 搜索 datatype 未找到，尝试搜索 interface`
    );
    // 没搜到 datatype 搜 interface
    const searchInterfaceResult = (await searchInterfaceByPath(
      projectId,
      interfaceId,
      interfaceName,
      "interfaces"
    )) as SearchInterfaceItem;
    if (searchInterfaceResult) {
      console.warn(
        `[ok] ( id: ${projectId}, name: ${interfaceName} ) interface 已找到 ${interfaceName}`
      );
      const nextProjectId = searchInterfaceResult.resData.projectId;
      await getAllTypes(nextProjectId);
      return getDataType(nextProjectId, interfaceId, interfaceName);
    }
    console.warn(
      `[4/4] ( id: ${projectId}, name: ${interfaceName} ) 搜索 interface 和 datatype 均未找到，自己手动填写吧..`
    );
    return null;
  }

  return targetTypeItem;
};

/*
// 从 progroups 查询 对应 projectId
export const getProGroupsStorageKey = (id) =>
  `${STORAGE_PREFIX}-progroups-${id}`;
export const getProjectsByProGroupId = async (
  proGroupId: number
): Promise<ProjectParams[]> => {
  const SESSION_STORAGE_KEY = getProGroupsStorageKey(proGroupId);
  const groups = JSON.parse(
    sessionStorage.getItem(SESSION_STORAGE_KEY)
  ) as ProGroups;

  if (groups) {
    return groups.projects;
  }

  const _groups: ProGroups = await fetch(getProGroupsByProGroupId(proGroupId))
    .then(async (response: any) => {
      const res = await response.json();
      if (!res?.code || res?.code !== 200) {
        throw new Error(res.msg ?? "error");
      }
      return res?.result;
    })
    .catch((err) => {
      console.error(err);
      return Promise.reject(err);
    });

  if (!_groups) {
    return null;
  }

  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(_groups));

  return _groups.projects;
};
export const getProjectByProGroupIdAndName = async (
  proGroupId: number,
  name: string
) => {
  const projects = await getProjectsByProGroupId(proGroupId);
  if (!projects) {
    return null;
  }

  console.log(projects);

  return projects.find((project) => project.name === name);
};
*/

// 获取当前页面参数
export type PageParams = {
  interface: boolean;
  datatype: boolean;
  id: number;
  pid: number;
};
export const INTERFACE_ID_LIST_KEY = `${STORAGE_PREFIX}-ids`;
export const getCurrentPageConfig = (): PageParams => {
  // return {
  //   interface: true,
  //   datatype: false,
  //   id: 18160,
  //   pid: 11882,
  // } as PageParams;
  const params: any = qs.parse(location.search) ?? {};
  const type = location.pathname.match(/\/(\w+)\//)?.[1];
  params.interface = type === "interface";
  params.datatype = type === "datatype";
  window[`${STORAGE_PREFIX}-params`] = params;
  return params;
};

// 设置 interface load list
export const setInterfaceIdList = (value: any) => {
  const interfaceIdList =
    (JSON.parse(sessionStorage.getItem(INTERFACE_ID_LIST_KEY)) as number[]) ??
    [];
  const fn: (list: number[]) => number[] =
    typeof value === "function"
      ? value
      : (nextList) => {
          return nextList.concat(value);
        };
  const nextList = fn(interfaceIdList);
  sessionStorage.setItem(INTERFACE_ID_LIST_KEY, JSON.stringify(nextList));
};
export const getInterfaceIdList = (): number[] => {
  return JSON.parse(sessionStorage.getItem(INTERFACE_ID_LIST_KEY)) ?? [];
};
