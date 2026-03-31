// Во избежание ошибок импорт должен быть из `@reduxjs/toolkit/query/react`
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  CreatePlaylistArgs,
  FetchPlaylistsArgs,
  PlaylistData,
  PlaylistsResponse,
  UpdatePlaylistArgs,
} from '@/features/playlists/api/playlistsApi.types.ts'


export const playlistsApi = createApi({
  // `reducerPath` - имя куда будут сохранены состояние и экшены для этого `API`
  reducerPath: 'playlistsApi',
  // `baseQuery` - конфигурация для `HTTP-клиента`, который будет использоваться для отправки запросов
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    headers: {
      'API-KEY': import.meta.env.VITE_API_KEY,
    },
    prepareHeaders: (headers) => {
      headers.set('Authorization', `Bearer ${import.meta.env.VITE_ACCESS_TOKEN}`)
      return headers
    },
  }),

  tagTypes: ['Playlist'],

  endpoints: (build) => ({
    fetchPlaylists: build.query<PlaylistsResponse, FetchPlaylistsArgs>({
      query: () => {
        return {
          method: 'get',
          url: `playlists`,
        }
      },
      providesTags: ['Playlist'],
    }),

    createPlaylist: build.mutation<{ data: PlaylistData }, CreatePlaylistArgs>({
      query: (body) => ({
        url: 'playlists',
        method: 'post',
        body: {
          data: {
            type: 'playlists',
            attributes: {
              title: body.title,
              description: body.description ?? null,
            },
          },
        },
      }),
      invalidatesTags: ['Playlist'],
    }),

    deletePlaylist: build.mutation<void, string>({
      query: (playlistId) => ({
        url: `playlists/${playlistId}`,
        method: 'delete',
      }),
      invalidatesTags: ['Playlist'],
    }),

    updatePlaylist: build.mutation<void, { playlistId: string; body: UpdatePlaylistArgs }>({
      query: ({ playlistId, body }) => ({
        url: `playlists/${playlistId}`,
        method: 'put',
        body: {
          data: {
            type: 'playlists',
            attributes: {
              title: body.title,
              description: body.description ?? null,
              tagIds: body.tagIds,
            },
          },
        },
      }),
      invalidatesTags: ['Playlist'],
    }),
  }),
})

export const { useFetchPlaylistsQuery, useCreatePlaylistMutation, useDeletePlaylistMutation, useUpdatePlaylistMutation } = playlistsApi
