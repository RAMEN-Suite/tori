import { PageMetaDto } from '../models/dtos/page-meta.dto';

export function createEmptyPageMeta(take = 10): PageMetaDto {
  return {
    hasNextPage: false,
    hasPreviousPage: false,
    itemCount: 0,
    page: 1,
    pageCount: 0,
    take,
  };
}
