export const initialArg = {
  dataList: [],
  searchValue: "",
  allData: [],
  currentPage: 0,
  pageSize: 10,
  filterKeys: [],
};

export const reducerAction = {
  SET_DATA: "SET_DATA",
  SEARCH: "SEARCH",
  PAGE_SIZE: "PAGE_SIZE",
  PAGE_CHANGE: "PAGE_CHANGE",
};
export const tableReducer = (state, action) => {
  if (action.type === reducerAction.SET_DATA) {
    return {
      ...state,
      dataList: dataListMaker(action.payload?.data, state.pageSize),
      pageSize: action?.payload?.defaultSize ?? state.pageSize,
      allData: action.payload?.data,
      filterKeys:
        action?.payload?.searchKeys ??
        action?.payload?.tableData
          ?.filter((item) => item.search)
          ?.map((item) => item.key) ??
        state.filterKeys,
    };
  } else if (action.type === reducerAction.SEARCH) {
    return {
      ...state,
      searchValue: action.payload,
      currentPage: 0,
      dataList: searchHandler(state.allData, action.payload, state),
    };
  } else if (action.type === reducerAction.PAGE_SIZE) {
    return {
      ...state,
      pageSize: action.payload,
      dataList: dataListMaker(state.allData, action.payload),
    };
  } else if (action.type === reducerAction.PAGE_CHANGE) {
    return {
      ...state,
      currentPage: action.payload - 1,
    };
  }
};

const dataListMaker = (data, pageSize) => {
  const groupPageWise = [];
  for (let i = 0; i < Math.ceil(data.length / pageSize); i++) {
    groupPageWise.push(data.slice(i * pageSize, i * pageSize + pageSize));
  }
  return groupPageWise;
};

const searchHandler = (data, searchValue = "", { filterKeys, pageSize }) => {
  const filteredData = data.filter((item) => {
    return filterKeys.some((key) => {
      return String(item[key])
        .toLowerCase()
        .includes(searchValue.toLowerCase());
    });
  });
  return dataListMaker(filteredData, pageSize);
};
