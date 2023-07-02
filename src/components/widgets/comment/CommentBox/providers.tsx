'use client'

import { createContext, memo, useEffect, useRef } from 'react'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { CommentModel } from '@mx-space/api-client'
import type { FC, PropsWithChildren } from 'react'

import { setCommentActionLeftSlot, useCommentActionLeftSlot } from './hooks'

const commentStoragePrefix = 'comment-'
export const createInitialValue = () => ({
  refId: atom(''),

  text: atom(''),
  author: atomWithStorage(`${commentStoragePrefix}author`, ''),
  mail: atomWithStorage(`${commentStoragePrefix}mail`, ''),
  url: atomWithStorage(`${commentStoragePrefix}url`, ''),

  avatar: atom(''),
  source: atom(''),

  // settings
  isWhisper: atomWithStorage(`${commentStoragePrefix}is-whisper`, false),
  syncToRecently: atomWithStorage(
    `${commentStoragePrefix}sync-to-recently`,
    true,
  ),
})
export const CommentBoxContext = createContext<
  ReturnType<typeof createInitialValue>
>(null!)
export const CommentBoxProvider = (
  props: PropsWithChildren & { refId: string },
) => {
  const { refId, children } = props
  return (
    <CommentBoxContext.Provider
      key={refId}
      value={
        useRef({
          ...createInitialValue(),
          refId: atom(refId),
        }).current
      }
    >
      {children}
    </CommentBoxContext.Provider>
  )
}

export const CommentIsReplyContext = createContext(false)
export const CommentOriginalRefIdContext = createContext('')
export const CommentCompletedCallbackContext = createContext<
  null | ((comment: CommentModel) => void)
>(null)
export const CommentIsReplyProvider = (
  props: PropsWithChildren<{
    isReply: boolean
    originalRefId: string
    onCompleted?: (comment: CommentModel) => void
  }>,
) => {
  const { isReply, originalRefId, onCompleted, children } = props
  return (
    <CommentOriginalRefIdContext.Provider value={originalRefId}>
      <CommentIsReplyContext.Provider value={isReply}>
        <CommentCompletedCallbackContext.Provider value={onCompleted || null}>
          {children}
        </CommentCompletedCallbackContext.Provider>
      </CommentIsReplyContext.Provider>
    </CommentOriginalRefIdContext.Provider>
  )
}

export const CommentBoxSlotPortal = memo(
  (props: { children: React.JSX.Element }) => {
    const { children } = props
    useEffect(() => {
      setCommentActionLeftSlot(children)
      return () => {
        setCommentActionLeftSlot(null)
      }
    }, [children])
    return null
  },
)

export const CommentBoxSlotProvider: FC = memo(() => {
  return useCommentActionLeftSlot()
})

CommentBoxSlotProvider.displayName = 'CommentBoxSlotProvider'
CommentBoxSlotPortal.displayName = 'CommentBoxSlotPortal'
