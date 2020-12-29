import {
  getInterface,
  getDataType,
  STORAGE_PREFIX,
  PUBLIC_PROJECT_ID,
  // getProjectByProGroupIdAndName,
} from "./data-center";
import { InterfaceItem, SubInterfaceItem, DataTypeItem } from "../types";
import {
  genEpicsTemplate,
  genReducersTemplate,
  genTypesTemplate,
} from "./template";

export interface InjectParams {
  _interface: InterfaceItem;
  projectId: number;
  interfaceIdList: number[];
  interfaceName: string;
  inputs: SubInterfaceItem[];
  outputs: SubInterfaceItem[];
}

export const NEI_BASE_TYPES = {
  Number: "Number",
  String: "String",
  Array: "Array",
  Boolean: "Boolean",
  Object: "Object",
};

const getDataTypesByRecursion = (
  projectId: number,
  interfaceId: number
) => async (typename: string, result?: any) => {
  // console.log(projectId, interfaceId, typename, result);
  // typename 对应 SubInterfaceItem .typeName 和 DataTypeItem .name
  const isBaseType = NEI_BASE_TYPES[typename];
  if (isBaseType) {
    return null;
  }

  const subInterfaceData = await getDataType(projectId, interfaceId, typename);
  // console.log("getDataType: ", subInterfaceData);

  if (!subInterfaceData) {
    return null;
  }

  for (let i = 0; i < subInterfaceData.params.length; i += 1) {
    const item = subInterfaceData.params[i];
    if (!NEI_BASE_TYPES[item.typeName]) {
      console.log("not a base DataType: ", item, item.typeName);
      const types = await getDataTypesByRecursion(
        subInterfaceData.projectId,
        interfaceId
      )(item.typeName, item);
      item.childComposedInterface = types ?? null;
    }
  }
  // console.log("datatypes: ", result ?? subInterfaceData);
  return subInterfaceData;
};

export const getTypesDefine = (
  projectId: number,
  interfaceId: number | number[]
) => async (genTemplate: (params: InjectParams[]) => Promise<string>) => {
  const interfaceIdList = [].concat(interfaceId);

  const composedParams = [];
  for (let i = 0; i < interfaceIdList.length; i += 1) {
    const interfaceData = await getInterface(interfaceIdList[i]);
    const interfaceName =
      interfaceData.path.match(/\/(\w+)\.(\w+)/)?.pop() ??
      `ANOYMOUS_INTERFACE_${Date.now()
        .toString()
        .slice(5)}`;
    const inputs = interfaceData.params.inputs;
    for (let j = 0; j < inputs.length; j += 1) {
      const row = inputs[j];
      const isBaseType = NEI_BASE_TYPES[row.typeName];
      row.childComposedInterface = isBaseType
        ? null
        : await getDataTypesByRecursion(
            projectId,
            interfaceIdList[i]
          )(row.typeName);
    }
    const outputs = interfaceData.params.outputs;
    for (let j = 0; j < outputs.length; j += 1) {
      const row = outputs[j];
      const isBaseType = NEI_BASE_TYPES[row.typeName];
      row.childComposedInterface = isBaseType
        ? null
        : await getDataTypesByRecursion(
            projectId,
            interfaceIdList[i]
          )(row.typeName);
    }
    const params: InjectParams = {
      _interface: interfaceData,
      projectId,
      interfaceIdList,
      interfaceName,
      inputs,
      outputs,
    };
    composedParams.push(params);
  }
  try {
    return genTemplate?.(composedParams) ?? genTypesTemplate(composedParams);
  } catch (err) {
    console.error(`template error, ${err}`);
    return null;
  }
};

export const getReducersDefine = (
  projectId: number,
  interfaceId: number | number[]
) => async (genTemplate: (params: InjectParams[]) => Promise<string>) => {
  return getTypesDefine(
    projectId,
    interfaceId
  )(genTemplate ?? genReducersTemplate);
};

export const getEpicsDefine = (
  projectId: number,
  interfaceId: number
) => async (genTemplate: (params: InjectParams[]) => Promise<string>) => {
  return getTypesDefine(
    projectId,
    interfaceId
  )(genTemplate ?? genEpicsTemplate);
};
