import Cypher from '@neo4j/cypher-builder';
import type { SetParam } from '@neo4j/cypher-builder';
import { EntityPropertyKeys } from '../constants';

const parseStringToSearchArray = (string: string): string[] => {
  const toBeRemoved = [',', '(', ')', '>', '<', '.', '*', ';', '/', '-'];

  return toBeRemoved
    .reduce((acc, char) => acc.split(char).join(' '), string)
    .split(' ')
    .filter((f) => f.length > 1);
};

const parseStringToSearchQueryString = (string: string): string => {
  return parseStringToSearchArray(string).join('* AND ') + '*';
};

const metadataForNewNode = (node: Cypher.Node): SetParam[] => {
  return [
    [node.property(EntityPropertyKeys.CREATED_AT), Cypher.localdatetime()],
    [node.property(EntityPropertyKeys.UPDATED_AT), Cypher.localdatetime()],

    [node.property(EntityPropertyKeys.VERSION), new Cypher.Literal(1)],
  ];
};

const metadataForUpdateNode = (node: Cypher.Node): SetParam[] => {
  return [
    [node.property(EntityPropertyKeys.UPDATED_AT), Cypher.localdatetime()],
    [node.property(EntityPropertyKeys.VERSION), Cypher.plus(node.property(EntityPropertyKeys.VERSION), new Cypher.Literal(1))],
  ];
};

export { parseStringToSearchArray, parseStringToSearchQueryString, metadataForNewNode, metadataForUpdateNode };
