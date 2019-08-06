// @flow

export type DynalistBookmark = {
  title: string,
  url: string,
  tags: string,
  notes: string,
}

export type EventMessage = {
  status: boolean,
  action: string,
  data?: { [key: string]: any } | any,
}

export type DynalistConfig = {
  api_token: string,
  document_id: string,
  document_name: string,
  parent_id?: string,
  is_inbox: boolean,
}

export type CallbackResponse = {
    status?: boolean,
    data?:  {[key: string]: any} | any,
}

export type Callback = (response: CallbackResponse) => any