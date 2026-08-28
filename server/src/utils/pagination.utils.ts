import { PageOptionsDto } from '../dto/page-options.dto';
import Cypher from '@neo4j/cypher-builder';

export function addPaginationSubclause(query: Cypher.With, pageOptionsDto: PageOptionsDto) {
  let paginatedQuery = query.limit(new Cypher.Literal(pageOptionsDto.take));
  if (pageOptionsDto.skip > 0) {
    paginatedQuery = paginatedQuery.skip(new Cypher.Literal(pageOptionsDto.skip));
  }
  return paginatedQuery;
}
