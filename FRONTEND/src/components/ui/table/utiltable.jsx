import React, { useEffect, useReducer } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";
import { Search } from "lucide-react";
import { Input } from "../input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../table";
import { initialArg, reducerAction, tableReducer } from "./table.config";
import UtilLoading from "../utilLoading";
import { TablePagination } from "./tablePagination";

function Utiltable({
  info,
  loading = false,
  tableData,
  data,
  pagiation = { showPageSize: true, defaultSize: 10 },
  search = { showSearch: true },
  tableAction = "",
  rows = {},
}) {
  const [state, dispatch] = useReducer(tableReducer, initialArg);

  const { dataList, searchValue, currentPage, pageSize, filterKeys } = state;

  useEffect(() => {
    if (Array.isArray(data)) {
      handleDispatch(reducerAction.SET_DATA, {
        data,
        tableData,
        defaultSize: pagiation?.defaultSize,
        searchKeys: search?.searchKeys ?? null,
      });
    }
  }, [data]);

  const handleDispatch = (action, value) => {
    dispatch({ type: action, payload: value });
  };

  return (
    <Card>
      <CardHeader className="py-0 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{info?.title}</CardTitle>
            <CardDescription>{info?.description}</CardDescription>
          </div>
          <div>
            {tableAction && <div className="pb-3">{tableAction}</div>}

            <div className="flex items-center">
              {pagiation?.showPageSize && (
                <div className="pr-3">
                  <select
                    value={pageSize}
                    onChange={(e) =>
                      handleDispatch(reducerAction.PAGE_SIZE, e.target.value)
                    }
                    className="h-6 rounded-md border text-sm"
                  >
                    {[10, 20, 50, 100].map((item, index) => (
                      <option key={index} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <TablePagination
                currentPage={currentPage + 1}
                totalPages={dataList.length}
                onPageChange={(page) =>
                  handleDispatch(reducerAction.PAGE_CHANGE, page)
                }
              />
            </div>
          </div>
        </div>

        {search?.showSearch && filterKeys?.length > 0 && (
          <div className="relative pt-2 w-full">
            <Search className="absolute left-2 top-5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={info?.placeholder ?? "Search"}
              className="pl-12 w-full"
              value={searchValue}
              onChange={(e) =>
                handleDispatch(reducerAction.SEARCH, e.target.value)
              }
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <UtilLoading />
        ) : dataList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchValue
              ? "No item found matching your search"
              : "No item found"}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {tableData?.map((item, index) => (
                  <TableHead className={item?.className} key={index}>
                    {item?.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataList[currentPage]?.map((item, index) => (
                <TableRow
                  className={rows?.className?.(item, index) ?? ""}
                  onClick={() => rows?.onClick?.(item)}
                  key={index}
                >
                  {tableData?.map((data, index) => (
                    <TableCell className={data?.className} key={index}>
                      {data?.custom
                        ? data?.custom(item, index)
                        : item[data?.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default Utiltable;
