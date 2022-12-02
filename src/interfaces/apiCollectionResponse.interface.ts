export interface ApiCollectionRequest {
  page: number;
  take: number;
}

export interface ApiCollectionResponse {
  count: number;
  collection: any[];
}
