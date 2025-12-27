import { useState, useEffect, useRef } from 'react';
import { useGetItemsQuery } from '../store/api/itemsApi';

interface UseInfiniteScrollOptions {
  selectedOnly: boolean;
  limit?: number;
}

export function useInfiniteScroll({
  selectedOnly,
  limit = 20,
}: UseInfiniteScrollOptions) {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetching } = useGetItemsQuery({
    page,
    limit,
    filter: filter || undefined,
    selectedOnly,
  });

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      if (
        scrollHeight - scrollTop <= clientHeight + 100 &&
        !isFetching &&
        data &&
        data.items.length < data.total
      ) {
        setPage((prev) => prev + 1);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isFetching, data]);

  const resetPage = () => {
    setPage(1);
  };

  return {
    data,
    isLoading,
    isFetching,
    filter,
    setFilter,
    containerRef,
    resetPage,
  };
}
