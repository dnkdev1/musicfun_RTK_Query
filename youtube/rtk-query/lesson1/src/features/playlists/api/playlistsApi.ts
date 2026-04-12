import type {
  CreatePlaylistArgs,
  FetchPlaylistsArgs,
  PlaylistData,
  PlaylistsResponse,
  UpdatePlaylistArgs,
} from '@/features/playlists/api/playlistsApi.types.ts'
import { baseApi } from '@/app/api/baseApi.ts'
import type { Images } from '@/common/types'


export const playlistsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchPlaylists: build.query<PlaylistsResponse, FetchPlaylistsArgs>({
      query: (params) => ({ url: 'playlists', params }),
      providesTags: ['Playlist'],
    }),
    // createPlaylist: build.mutation<{ data: PlaylistData }, CreatePlaylistArgs>({
    //   query: (body) => ({ method: 'post', url: 'playlists', body }),
    //   invalidatesTags: ['Playlist'],
    // }),

    createPlaylist: build.mutation<{ data: PlaylistData }, CreatePlaylistArgs>({
      query: (body) => ({
        method: 'post',
        url: 'playlists',
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
      query: (playlistId) => ({ method: 'delete', url: `playlists/${playlistId}` }),
      invalidatesTags: ['Playlist'],
    }),

    updatePlaylist: build.mutation<void, { playlistId: string; body: UpdatePlaylistArgs }>({
      query: ({ playlistId, body }) => ({
        method: 'put',
        url: `playlists/${playlistId}`,
        body: {
          data: {
            type: 'playlists',
            attributes: {
              title: body.title,
              description: body.description ?? null,
              tagIds: body.tagIds ?? [],
            },
          },
        },
      }),

      async onQueryStarted({ playlistId, body }, { queryFulfilled, dispatch, getState }) {
        const args = playlistsApi.util.selectCachedArgsForQuery(getState(), 'fetchPlaylists')

        const patches: any[] = []

        args.forEach((arg) => {
          patches.push(
            dispatch(
              playlistsApi.util.updateQueryData(
                'fetchPlaylists',
                {
                  pageNumber: arg.pageNumber,
                  pageSize: arg.pageSize,
                  search: arg.search,
                },
                (state) => {
                  const index = state.data.findIndex((p) => p.id === playlistId)

                  if (index !== -1) {
                    state.data[index].attributes = {
                      ...state.data[index].attributes,
                      title: body.title,
                      description: body.description ?? null,
                      tagIds: body.tagIds ?? [],
                    }
                  }
                },
              ),
            ),
          )
        })

        try {
          await queryFulfilled
        } catch {
          patches.forEach((p) => p.undo())
        }
      },

      invalidatesTags: ['Playlist'],
    }),

    uploadPlaylistCover: build.mutation<Images, { playlistId: string; file: File }>({
      query: ({ playlistId, file }) => {
        const formData = new FormData()
        formData.append('file', file)
        return { method: 'post', url: `playlists/${playlistId}/images/main`, body: formData }
      },
      invalidatesTags: ['Playlist'],
    }),
    deletePlaylistCover: build.mutation<void, { playlistId: string }>({
      query: ({ playlistId }) => ({ method: 'delete', url: `playlists/${playlistId}/images/main` }),
      invalidatesTags: ['Playlist'],
    }),
  }),
})

export const {
  useFetchPlaylistsQuery,
  useCreatePlaylistMutation,
  useDeletePlaylistMutation,
  useUpdatePlaylistMutation,
  useUploadPlaylistCoverMutation,
  useDeletePlaylistCoverMutation,
} = playlistsApi


// export const playlistsApi = baseApi.injectEndpoints({
//   endpoints: (build) => ({
//     fetchPlaylists: build.query<PlaylistsResponse, FetchPlaylistsArgs>({
//       query: (params) => ({ url: `playlists`, params }),
//       providesTags: ['Playlist'],
//     }),
//
//     createPlaylist: build.mutation<{ data: PlaylistData }, CreatePlaylistArgs>({
//       query: (body) => ({
//         url: 'playlists',
//         method: 'post',
//         body: {
//           data: {
//             type: 'playlists',
//             attributes: {
//               title: body.title,
//               description: body.description ?? null,
//             },
//           },
//         },
//       }),
//       invalidatesTags: ['Playlist'],
//     }),
//
//     deletePlaylist: build.mutation<void, string>({
//       query: (playlistId) => ({
//         url: `playlists/${playlistId}`,
//         method: 'delete',
//       }),
//       invalidatesTags: ['Playlist'],
//     }),
//
//     updatePlaylist: build.mutation<void, { playlistId: string; body: UpdatePlaylistArgs }>({
//       query: ({ playlistId, body }) => ({ url: `playlists/${playlistId}`, method: 'put', body }),
//       async onQueryStarted({ playlistId, body }, { dispatch, queryFulfilled, getState }) {
//         const args = playlistsApi.util.selectCachedArgsForQuery(getState(), 'fetchPlaylists')
//
//         const patchResults: any[] = []
//
//         args.forEach((arg) => {
//           patchResults.push(
//             dispatch(
//               playlistsApi.util.updateQueryData(
//                 'fetchPlaylists',
//                 {
//                   pageNumber: arg.pageNumber,
//                   pageSize: arg.pageSize,
//                   search: arg.search,
//                 },
//                 (state) => {
//                   const index = state.data.findIndex((playlist) => playlist.id === playlistId)
//                   if (index !== -1) {
//                     state.data[index].attributes = { ...state.data[index].attributes, ...body }
//                   }
//                 },
//               ),
//             ),
//           )
//         })
//
//         try {
//           await queryFulfilled
//         } catch {
//           patchResults.forEach((patchResult) => {
//             patchResult.undo()
//           })
//         }
//       },
//       invalidatesTags: ['Playlist'],
//     }),
//
//     // updatePlaylist: build.mutation<void, { playlistId: string; body: UpdatePlaylistArgs }>({
//     //   query: ({ playlistId, body }) => ({ url: `playlists/${playlistId}`, method: 'put', body }),
//     //   async onQueryStarted({ playlistId, body }, { dispatch, queryFulfilled }) {
//     //     const patchResult = dispatch(
//     //       playlistsApi.util.updateQueryData(
//     //         // название эндпоинта, в котором нужно обновить кэш
//     //         'fetchPlaylists',
//     //         // аргументы для эндпоинта
//     //         { pageNumber: 1, pageSize: 2, search: '' },
//     //         // `updateRecipe` - коллбэк для обновления закэшированного стейта мутабельным образом
//     //         (state) => {
//     //           const index = state.data.findIndex((playlist) => playlist.id === playlistId)
//     //           if (index !== -1) {
//     //             state.data[index].attributes = { ...state.data[index].attributes, ...body }
//     //           }
//     //         },
//     //       ),
//     //     )
//     //     try {
//     //       await queryFulfilled
//     //     } catch {
//     //       patchResult.undo()
//     //     }
//     //   },
//     //   invalidatesTags: ['Playlist'],
//     // }),
//
//     uploadPlaylistCover: build.mutation<Images, { playlistId: string; file: File }>({
//       query: ({ playlistId, file }) => {
//         const formData = new FormData()
//         formData.append('file', file)
//         return {
//           url: `playlists/${playlistId}/images/main`,
//           method: 'post',
//           body: formData,
//         }
//       },
//       invalidatesTags: ['Playlist'],
//     }),
//
//     deletePlaylistCover: build.mutation<void, { playlistId: string }>({
//       query: ({ playlistId }) => ({ url: `playlists/${playlistId}/images/main`, method: 'delete' }),
//       invalidatesTags: ['Playlist'],
//     }),
//   }),
// })
//
// export const {
//   useFetchPlaylistsQuery,
//   useCreatePlaylistMutation,
//   useDeletePlaylistMutation,
//   useUpdatePlaylistMutation,
//   useUploadPlaylistCoverMutation,
//   useDeletePlaylistCoverMutation,
// } = playlistsApi
