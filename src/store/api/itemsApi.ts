import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  IGetItemsRequest,
  IGetItemsResult,
  IOperatedItemRequest,
  IOperatedItemResult,
  IReorderItemsRequest,
} from '../../types';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001/api/items';

export const itemsApi = createApi({
  reducerPath: 'itemsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
  }),
  tagTypes: ['Items'],
  endpoints: (builder) => ({
    getItems: builder.query<IGetItemsResult, IGetItemsRequest>({
      query: ({ page, limit, filter, selectedOnly }) => ({
        url: '/',
        params: {
          page,
          limit,
          ...(filter && { filter }),
          ...(selectedOnly !== undefined && {
            selectedOnly: selectedOnly.toString(),
          }),
        },
      }),

      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.filter || ''}-${
          queryArgs.selectedOnly || false
        }`;
      },

      merge: (currentCache, newItems) => {
        if (newItems.page === 1) {
          return newItems;
        }

        return {
          ...newItems,
          items: [...currentCache.items, ...newItems.items],
        };
      },

      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
      providesTags: ['Items'],
    }),
    addItem: builder.mutation<IOperatedItemResult, IOperatedItemRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Items'],
    }),

    selectItem: builder.mutation<IOperatedItemResult, IOperatedItemRequest>({
      query: (body) => ({
        url: '/select',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Items'],
    }),
    reorderItems: builder.mutation<IOperatedItemResult, IReorderItemsRequest>({
      query: (body) => ({
        url: '/reorder',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Items'],
    }),
  }),
});

export const {
  useGetItemsQuery,
  useAddItemMutation,
  useSelectItemMutation,
  useReorderItemsMutation,
} = itemsApi;
