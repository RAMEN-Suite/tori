export const ENTITY_LABEL_NAME = 'Entity';
export const ENTITY_NAME_PROPERTY = 'label';
export const COLLECTION_LABEL_NAME = 'Collection';
export const ANNOTATION_LABEL_NAME = 'Annotation';
export const ANNOTATION_TYPE_NAME = 'type';
export const CONTENT_LABEL_NAME = 'Content';
export const BASE_DATA_TYPES = ['String', 'Boolean', 'Integer', 'Float'];
export const TO_ANNOTATION_REL_TYPE = 'HAS_ANNOTATION';
export const FROM_ANNOTATION_REL_TYPE = 'REFERS_TO';

export const GUEST_DEFAULT_USER = {
  ID: 'system:guest',
};

enum USER_PROPERTIES {
  ID = 'id',
}
export const USER = {
  LABEL: 'UserProfile',
  PROPERTIES: USER_PROPERTIES,
};

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum EntityPropertyKeys {
  CREATED_AT = '_created_at',
  UPDATED_AT = '_updated_at',
  VERSION = '_version',
}
