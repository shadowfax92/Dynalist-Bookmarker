// @flow

export type DynalistBookmark = {
  title: string,
  url: string,
  tags: Array<string>,
  note: string,
}

export type EventMessage = {
  status: boolean,
  action: string,
  data?: any,
}

export type DynalistConfig = {
  api_token: string,
  document_id: string,
  parent_id?: string,
  is_inbox?: boolean,
}

export type CallbackResponse = {
    status?: boolean,
    data?: any | typeof(undefined),
}
