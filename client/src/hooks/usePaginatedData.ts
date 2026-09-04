import { useState, useEffect, useCallback } from 'react';
import { api, type QueryParams, type PaginatedResult } from '@/lib/api';

export function usePaginatedData<T extends { id: string }>(
  fetcher: (params: QueryParams) => Promise<PaginatedResult<T>>,
  searchFields: string[],
  initialFilters: Record<string, string> = {},
) {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const params: QueryParams = { page, pageSize, search, sortBy, sortDir, filters };
    const result = await fetcher(params);
    setData(result.data);
    setTotal(result.total);
    setTotalPages(result.totalPages);
    setIsLoading(false);
  }, [fetcher, page, pageSize, search, sortBy, sortDir, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return {
    data, total, page, pageSize, totalPages, search, sortBy, sortDir, filters, isLoading,
    setPage, setPageSize, setSearch: handleSearch, setSortBy: handleSort, setFilters: handleFilter,
  };
}
