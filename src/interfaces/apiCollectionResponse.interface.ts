export interface ApiCollectionRequest {
  page: number;
  take: number;
}

export interface ApiCollectionResponse<T = any> {
  count: number;
  collection: T[];
}
