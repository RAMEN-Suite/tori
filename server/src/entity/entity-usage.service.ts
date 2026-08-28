import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../neo4j/neo4j.service';
import { RamenModelService } from '../schema/ramen-model.service';
import Cypher from '@neo4j/cypher-builder';
import { ENTITY_LABEL_NAME, USER } from '../constants';

@Injectable()
export class EntityUsageService {
  ENTITY_KEY_PROPERTY!: string;
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly model: RamenModelService,
  ) {
    this.ENTITY_KEY_PROPERTY = this.model.getNodeKeyField(ENTITY_LABEL_NAME);
  }

  public async recordView(actorId: string, entityId: string) {
    const uNode = new Cypher.Node();
    const eNode = new Cypher.Node();
    const viewedRelation = new Cypher.Relationship();

    const entityPattern = new Cypher.Pattern(eNode, {
      labels: ENTITY_LABEL_NAME,
      properties: {
        [this.ENTITY_KEY_PROPERTY]: new Cypher.Param(entityId),
      },
    });

    const userPattern = new Cypher.Pattern(uNode, {
      labels: USER.LABEL,
      properties: {
        [USER.PROPERTIES.ID]: new Cypher.Param(actorId),
      },
    });

    const relationPattern = new Cypher.Pattern(uNode)
      .related(viewedRelation, {
        type: 'VIEWED',
      })
      .to(eNode);

    const query = new Cypher.Match(entityPattern)
      .match(userPattern)
      .merge(relationPattern)
      .onCreateSet(
        [viewedRelation.property('count'), new Cypher.Literal(1)],
        [viewedRelation.property('lastViewedAt'), Cypher.localdatetime()],
      )
      .onMatchSet(
        [
          viewedRelation.property('count'),
          Cypher.plus(Cypher.coalesce(viewedRelation.property('count'), new Cypher.Literal(0)), new Cypher.Literal(1)),
        ],
        [viewedRelation.property('lastViewedAt'), Cypher.localdatetime()],
      );

    const { cypher, params } = query.build();
    await this.neo4jService.write(cypher, params);
  }
}
