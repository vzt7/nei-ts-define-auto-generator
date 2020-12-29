import { SubInterfaceItem, DataTypeItem, InterfaceItem } from "../types";
import { NEI_BASE_TYPES, InjectParams } from "./generator";

const space = (num: number = 1) => " ".repeat(num);
const getInterfaceName = (name) =>
  name?.replace(/\w/, ($0) => $0.toUpperCase());
const getFirstLowerCaseInterfaceName = (name) =>
  name?.replace(/\w/, ($0) => $0.toLowerCase());
const getUnderlineInterfaceName = (name) =>
  name?.replace(/\B([A-Z])/g, "_$1").toUpperCase();
const getRandomInterfaceName = () =>
  `_SET_YOUR_INTERFACE_NAME_${Date.now()
    .toString()
    .slice(5)}`;

/**
 * 处理 interface 内部关联类型 - （主要处理 datatype ）
 * @param {array} fileContent
 * @param {SubInterfaceItem} origin
 * @param {DataTypeItem} child
 * @param {number} deepth
 */
const getStringifySubType = async (
  fileContent: any,
  origin: SubInterfaceItem,
  child: DataTypeItem | null,
  deepth = 1
) => {
  if (!child) {
    return null;
  }

  // console.log("getStringifySubType", child);
  const rows = [];
  for (let i = 0; i < child.params.length; i += 1) {
    const item = child.params[i];

    let typeName: string = item.typeName;
    if (!NEI_BASE_TYPES[item.typeName]) {
      await getStringifySubType(
        fileContent,
        origin,
        item.childComposedInterface,
        deepth + 1
      );
      const typeInterfaceName = getInterfaceName(
        item.childComposedInterface?.name
      );
      typeName = typeInterfaceName ?? getInterfaceName(item.typeName);
    } else {
      typeName = typeName.toLowerCase();
    }

    const nameSuffix: string = item.required ? "" : "?";
    const reserveSpace: number = ~~(
      2 +
      item.name.length +
      nameSuffix.length +
      2 +
      typeName.length
    );
    const getResult = (maxReserveSpace = 1) => {
      return `${space(2)}${item.name}: ${typeName},${
        item.description
          ? `${space(maxReserveSpace - reserveSpace)} // ${item.description}`
          : ""
      }`;
    };

    const row = {
      reserveSpace,
      getResult,
    };
    rows.push(row);
  }

  const maxReserveSpace = Math.max(...rows.map((row) => row.reserveSpace));
  const res = rows.map((row) => row.getResult(maxReserveSpace)).join("\n");

  const interfaceName = getInterfaceName(child.name);
  const wrapper = `// LinkedDataType (pid=${child.projectId}, id=${child.id})\nexport interface ${interfaceName} \{\n${res}\n\}`;
  fileContent.push(wrapper);

  return interfaceName;
};

/**
 * 数据处理 - （主要处理 interface ）
 * @param {array} fileContent
 * @param {SubInterfaceItem} item
 */
interface ComposedRow {
  name: string;
  nameSuffix: string;
  type: string;
  description: string;
  reserveSpace: number;
  getResult: (maxReserveSpace) => string;
}
const getComposedRow = async (fileContent, item: SubInterfaceItem) => {
  const name: string = item.name;
  const nameSuffix: string = item.required ? "" : "?";
  const type: string =
    NEI_BASE_TYPES[item.typeName]?.toLowerCase() ??
    (await getStringifySubType(
      fileContent,
      item,
      item.childComposedInterface
    )) ??
    item.typeName;
  const description: string = item.description;
  const reserveSpace: number = ~~(
    2 +
    item.name.length +
    nameSuffix.length +
    2 +
    type.length
  );
  const row: ComposedRow = {
    name,
    nameSuffix,
    type,
    description,
    reserveSpace,
    getResult: (maxReserveSpace) => {
      return `${space(2)}${name}${nameSuffix}: ${type};${
        description
          ? `${space(maxReserveSpace - reserveSpace)} // ${description}`
          : ""
      }`;
    },
  };
  return row;
};

/**
 * 生成模板通用方法
 * @param {InjectParams} params
 * @param {SubInterfaceItem[]} items
 * @param {GenTemplateOptions} options
 * @param customOptions
 */
interface GenTemplateOptions {
  deps?: string[];
  templateGenerator: (
    // comments: string,
    // interfaceName: string,
    rows: ComposedRow[],
    interfaceName: string | null,
    customOptions?: { [key: string]: any }
  ) => string;
}
const genTemplate = async (
  params: InjectParams,
  items: SubInterfaceItem[],
  options: GenTemplateOptions,
  customOptions?: { [key: string]: any }
) => {
  const fileContent = [];

  // deps
  if (options.deps) {
    fileContent.push(options.deps.join("\n"));
  }

  // interfaces - inputs
  const rows: ComposedRow[] = [];
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const row = await getComposedRow(fileContent, item);
    rows.push(row);
  }
  const interfaceName = getInterfaceName(params.interfaceName) ?? null;
  const interfaceTemplate = options.templateGenerator(
    rows,
    interfaceName,
    customOptions
  );

  fileContent.push(interfaceTemplate);
  return fileContent;
};

/**
 * 生成 types 模板
 * @param {array} fileContent
 * @param {InjectParams[]} item
 */
export const genTypesTemplate = async (params: InjectParams[]) => {
  const templateGenerator = (interfaceSuffix: string = "Request") => (
    rows: ComposedRow[],
    interfaceName: string
  ) => {
    const maxReserveSpace = Math.max(...rows.map((row) => row.reserveSpace));
    const stringifyRows =
      rows.map((row) => row.getResult(maxReserveSpace)).join("\n") ||
      `  // 未找到或不存在参数定义 - ${interfaceName}`;
    const template = `export interface ${
      interfaceName
        ? `${interfaceName}${interfaceSuffix}`
        : getRandomInterfaceName()
    } \{\n${stringifyRows}\n\}`;
    return template;
  };

  const inputInterfaces = [];
  const ouputInterfaces = [];
  for (let i = 0; i < params.length; i += 1) {
    const item = params[i];
    const inputInterfaceRes = await genTemplate(item, item.inputs, {
      templateGenerator: templateGenerator("Request"),
    });
    inputInterfaces.push(inputInterfaceRes.join("\n\n"));
    const outputInterfaceRes = await genTemplate(item, item.outputs, {
      templateGenerator: templateGenerator("Response"),
    });
    inputInterfaces.push(outputInterfaceRes.join("\n\n"));
  }

  return inputInterfaces.concat(ouputInterfaces).join("\n\n") + "\n";
};

/**
 * 生成 redux 模板
 * @param {InjectParams[]} params
 */
export const genReducersTemplate = async (params: InjectParams[]) => {
  const typeDeps = [];
  const actionsContent = [];
  const statesContent = [];
  const reducersContent = [];
  actionsContent.push(`const { Types, Creators } = createActions(\{`);
  statesContent.push(`const INITIAL_STATE = {`);
  reducersContent.push(`export default createReducer(INITIAL_STATE, \{`);

  const templateGenerator = (rows: ComposedRow[], interfaceName: string) => {
    typeDeps.push(`${interfaceName}Request`);

    // create actions
    const actionsRows = rows.map((row) => `"${row.name}"`).join(", ");
    const actionsRowsWithWrapper = `  ${interfaceName}: ${
      actionsRows ? `[${actionsRows}]` : null
    },\n  ${interfaceName}Success: null,`;
    actionsRows && actionsContent.push(actionsRowsWithWrapper);

    // initial state
    const statesRows = null;
    statesRows && statesContent.push(statesRows);

    // reducers
    const getReducersRow = (name) =>
      `${space(2)}[Types.${getUnderlineInterfaceName(name)}]: (\n${space(
        4
      )}state = INITIAL_STATE,\n${space(4)}action,\n${space(2)}) => \{\n${space(
        4
      )}return \{\n${space(6)}...state,\n${space(4)}\},\n${space(2)}\},`;
    const reducersRows = `${getReducersRow(interfaceName)}\n${getReducersRow(
      `${interfaceName}Success`
    )}`;
    reducersRows && reducersContent.push(reducersRows);

    return null;
  };

  for (let i = 0; i < params.length; i += 1) {
    const item = params[i];
    await genTemplate(item, item.inputs, { templateGenerator });
  }

  const deps = [];
  deps.push(
    `import \{\n  createActions,\n  createReducer,\n  DefaultActionCreators,\n\} from 'reduxsauce';`
  );
  deps.push(`import \{\n  ${typeDeps.join(",\n  ")},\n\} from './types.d';`);
  const defaultExports = `export \{ Creators as Creator, Types as Type \};`;

  actionsContent.push(`\});`);
  statesContent.push(`};`);
  reducersContent.push(`\}`);

  const result = [].concat(
    deps.join("\n"),
    actionsContent.join("\n"),
    statesContent.join("\n"),
    reducersContent.join("\n"),
    defaultExports
  );

  return result.join("\n\n") + "\n";
};

/**
 * 生成 epic 模板
 * @param {InjectParams[]} params
 */
export const genEpicsTemplate = async (params: InjectParams[]) => {
  const deps = [];
  const defaultExports = [];
  const typeDeps = [];

  deps.push(
    `import \{ ofType, Epic \} from 'redux-observable';`,
    `import \{ map, switchMap \} from 'rxjs/operators';`,
    `import \{ Type \} from './redux';`
  );
  defaultExports.push(`export default [`);

  const templateGenerator = (
    rows: ComposedRow[],
    interfaceName: string,
    customOptions
  ) => {
    const ofTypeValue = getUnderlineInterfaceName(interfaceName);
    const epicName = getFirstLowerCaseInterfaceName(interfaceName);
    const { interfacePath } = customOptions ?? {};

    typeDeps.push(getUnderlineInterfaceName(interfaceName));
    defaultExports.push(`${space(2)}${epicName},`);

    const fetchParams = rows.map((row) => row.name);

    const stringifyRequestBody =
      fetchParams?.length > 0
        ? `${space(8)}body: \{\n${space(10)}${fetchParams.join(
            `,\n${space(10)}`
          )},\n${space(8)}\},\n`
        : "";
    const epicContent = `${space(2)}action$.pipe(\n${space(
      4
    )}ofType(Type.${ofTypeValue}),\n${space(4)}switchMap((${
      fetchParams?.length > 0 ? `\{ ${fetchParams.join(", ")} \}` : ""
    }) => \{\n${space(6)}return fetch(\{\n${space(
      8
    )}url: '${interfacePath}',\n${stringifyRequestBody}${space(6)}\});\n${space(
      4
    )}}),\n${space(4)}map((res: any) => \{\n${space(6)}return \{\n${space(
      8
    )}type: Type.${ofTypeValue}_SUCCESS,\n${space(
      8
    )}data: res ?? null,\n${space(6)}\};\n${space(4)}}),\n${space(2)});`;

    const stringifyEpicWrapper = `const ${epicName}: Epic = (action$, state$, { fetch }) =>\n${epicContent}`;

    return stringifyEpicWrapper;
  };

  const epics = [];
  for (let i = 0; i < params.length; i += 1) {
    const item = params[i];
    const interfacePath = item._interface.path;
    const epic = await genTemplate(
      item,
      item.inputs,
      { templateGenerator },
      { interfacePath }
    );
    epic && epics.push(epic);
  }

  defaultExports.push(`];`);

  const result = [].concat(
    deps.join("\n"),
    epics.join("\n"),
    defaultExports.join("\n")
  );

  return result.join("\n\n") + "\n";
};
